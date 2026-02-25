import { useState, useEffect } from "react";
import { Send, Trash2 } from "lucide-react";
 import { formatDistanceToNow } from "date-fns";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { toast } from "sonner";
 
type CommentRow = Database["public"]["Tables"]["alumni_comments"]["Row"];

 interface Comment {
   id: string;
   post_id: string;
   author_id: string;
   content: string;
   created_at: string;
   author_profile?: {
     full_name: string | null;
     avatar_url: string | null;
   };
 }
 
 interface AlumniCommentsProps {
   postId: string;
   onCommentAdded?: () => void;
 }
 
 export function AlumniComments({ postId, onCommentAdded }: AlumniCommentsProps) {
   const [comments, setComments] = useState<Comment[]>([]);
   const [newComment, setNewComment] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const { user, profile } = useAuth();
 
   useEffect(() => {
     fetchComments();
 
     // Subscribe to new comments
     const channel = supabase
       .channel(`comments-${postId}`)
       .on(
         "postgres_changes",
         {
           event: "INSERT",
           schema: "public",
           table: "alumni_comments",
           filter: `post_id=eq.${postId}`,
         },
         async (payload) => {
          const newCommentData = payload.new as CommentRow;
           const { data: authorProfile } = await supabase
             .from("profiles")
             .select("user_id, full_name, avatar_url")
            .eq("user_id", newCommentData.author_id)
             .single();
 
           const newComment = {
            ...newCommentData,
             author_profile: authorProfile,
           } as Comment;
 
           setComments((prev) => [...prev, newComment]);
         }
       )
       .subscribe();
 
     return () => {
       supabase.removeChannel(channel);
     };
   }, [postId]);
 
   const fetchComments = async () => {
     try {
       const { data: commentsData, error } = await supabase
         .from("alumni_comments")
         .select("*")
         .eq("post_id", postId)
         .order("created_at", { ascending: true });
 
       if (error) throw error;
 
       if (commentsData && commentsData.length > 0) {
         const authorIds = [...new Set(commentsData.map((c) => c.author_id))];
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, full_name, avatar_url")
           .in("user_id", authorIds);
 
         const enrichedComments = commentsData.map((comment) => ({
           ...comment,
           author_profile: profiles?.find((p) => p.user_id === comment.author_id),
         }));
 
         setComments(enrichedComments as Comment[]);
       }
     } catch (error) {
       console.error("Error fetching comments:", error);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newComment.trim() || !user) {
       if (!user) toast.error("Please sign in to comment");
       return;
     }
 
     setIsLoading(true);
     try {
       const { error } = await supabase.from("alumni_comments").insert({
         post_id: postId,
         author_id: user.id,
         content: newComment.trim(),
       });
 
       if (error) throw error;
 
       setNewComment("");
       onCommentAdded?.();
     } catch (error) {
       console.error("Error adding comment:", error);
       toast.error("Failed to add comment");
     } finally {
       setIsLoading(false);
     }
    };

    const handleDeleteComment = async (commentId: string) => {
      try {
        const { error } = await supabase
          .from("alumni_comments")
          .delete()
          .eq("id", commentId);
        if (error) throw error;
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        onCommentAdded?.();
        toast.success("Comment deleted");
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("Failed to delete comment");
      }
    };
 
   const userInitials = profile?.full_name
     ?.split(" ")
     .map((n) => n[0])
     .join("")
     .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";
 
   return (
     <div className="border-t border-border/50 bg-muted/30 p-4">
       {/* Comments List */}
       <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
         {comments.length === 0 ? (
           <p className="text-sm text-muted-foreground text-center py-2">
             No comments yet. Be the first to comment!
           </p>
         ) : (
            comments.map((comment) => {
              const authorName =
                comment.author_profile?.full_name ||
                `User ${comment.author_id.slice(0, 8)}`;
              const initials = authorName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const isOwn = user?.id === comment.author_id;

              return (
                <div key={comment.id} className="flex gap-2 group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author_profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-background/80 rounded-xl px-3 py-2 flex items-start justify-between gap-2">
                      <div>
                        <span className="font-medium text-sm">{authorName}</span>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                      {isOwn && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            })
         )}
       </div>
 
       {/* Add Comment Form */}
       <form onSubmit={handleSubmit} className="flex gap-2">
         <Avatar className="h-8 w-8">
           <AvatarImage src={profile?.avatar_url || undefined} />
           <AvatarFallback className="bg-primary/10 text-primary text-xs">
             {userInitials}
           </AvatarFallback>
         </Avatar>
         <Input
           value={newComment}
           onChange={(e) => setNewComment(e.target.value)}
           placeholder="Write a comment..."
           className="flex-1 bg-background/50 border-primary/20"
           disabled={!user}
         />
         <Button
           type="submit"
           size="icon"
           disabled={!newComment.trim() || isLoading || !user}
           className="bg-primary hover:bg-primary/90"
         >
           <Send className="h-4 w-4" />
         </Button>
       </form>
     </div>
   );
 }