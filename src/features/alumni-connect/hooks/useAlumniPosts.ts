 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AlumniPostRow = Database["public"]["Tables"]["alumni_posts"]["Row"];
type AlumniReactionType = Database["public"]["Enums"]["alumni_reaction_type"];
 
 export interface AlumniPost {
   id: string;
   author_id: string;
   content: string;
   media_urls: string[];
   post_type: "update" | "achievement" | "job_posting" | "advice" | "event";
   likes_count: number;
   comments_count: number;
   visibility: "public" | "connections" | "private";
   created_at: string;
   updated_at: string;
   author_profile?: {
     full_name: string | null;
     avatar_url: string | null;
   };
   user_reaction?: string | null;
 }
 
 export function useAlumniPosts(filter: string = "all") {
   const [posts, setPosts] = useState<AlumniPost[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();
 
   const fetchPosts = async () => {
     setIsLoading(true);
     try {
      const query = supabase
         .from("alumni_posts")
         .select("*")
         .order("created_at", { ascending: false })
         .limit(20);
 
      const { data: postsData, error } = filter !== "all"
        ? await query.eq("post_type", filter as AlumniPostRow["post_type"])
        : await query;
 
       if (error) throw error;
 
       // Fetch author profiles separately
       if (postsData && postsData.length > 0) {
         const authorIds = [...new Set(postsData.map((p) => p.author_id))];
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, full_name, avatar_url")
           .in("user_id", authorIds);
 
         // Fetch user's reactions if logged in
        let userReactions: Record<string, AlumniReactionType> = {};
         if (user) {
           const { data: reactions } = await supabase
             .from("alumni_post_reactions")
             .select("post_id, reaction_type")
             .eq("user_id", user.id)
             .in("post_id", postsData.map((p) => p.id));
 
           if (reactions) {
             userReactions = reactions.reduce((acc, r) => {
              if (r.reaction_type) {
                acc[r.post_id] = r.reaction_type;
              }
              return acc;
            }, {} as Record<string, AlumniReactionType>);
           }
         }
 
         const enrichedPosts = postsData.map((post) => ({
           ...post,
           author_profile: profiles?.find((p) => p.user_id === post.author_id) || null,
            user_reaction: userReactions[post.id] ?? null,
         }));
 
         setPosts(enrichedPosts as AlumniPost[]);
       } else {
         setPosts([]);
       }
     } catch (error) {
       console.error("Error fetching posts:", error);
     } finally {
       setIsLoading(false);
     }
   };
 
   useEffect(() => {
     fetchPosts();
 
     // Set up realtime subscription
     const channel = supabase
       .channel("alumni-posts-changes")
       .on(
         "postgres_changes",
         { event: "INSERT", schema: "public", table: "alumni_posts" },
         async (payload) => {
          const newPostData = payload.new as AlumniPostRow;
           // Fetch the author profile for the new post
           const { data: profile } = await supabase
             .from("profiles")
             .select("user_id, full_name, avatar_url")
            .eq("user_id", newPostData.author_id)
             .single();
 
           const newPost = {
            ...newPostData,
             author_profile: profile,
             user_reaction: null,
           } as AlumniPost;
 
           setPosts((prev) => [newPost, ...prev]);
         }
       )
       .on(
         "postgres_changes",
         { event: "UPDATE", schema: "public", table: "alumni_posts" },
         (payload) => {
           setPosts((prev) =>
             prev.map((post) =>
               post.id === payload.new.id
                 ? { ...post, ...payload.new }
                 : post
             )
           );
         }
       )
       .on(
         "postgres_changes",
         { event: "DELETE", schema: "public", table: "alumni_posts" },
         (payload) => {
           setPosts((prev) => prev.filter((post) => post.id !== payload.old.id));
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [filter, user]);
 
   return { posts, isLoading, refetch: fetchPosts };
 }