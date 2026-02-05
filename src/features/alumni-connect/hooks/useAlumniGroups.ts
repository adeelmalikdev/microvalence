 import { useState, useEffect } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import type { Database } from "@/integrations/supabase/types";
 import { toast } from "sonner";
 
 type GroupRow = Database["public"]["Tables"]["alumni_groups"]["Row"];
 type GroupMemberRow = Database["public"]["Tables"]["alumni_group_members"]["Row"];
 
 export interface AlumniGroup extends GroupRow {
   is_member?: boolean;
   user_role?: string | null;
 }
 
 export function useAlumniGroups() {
   const [groups, setGroups] = useState<AlumniGroup[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const { user } = useAuth();
 
   const fetchGroups = async () => {
     setIsLoading(true);
     try {
       const { data: groupsData, error } = await supabase
         .from("alumni_groups")
         .select("*")
         .order("member_count", { ascending: false });
 
       if (error) throw error;
 
       if (groupsData && user) {
         // Check membership status for each group
         const { data: memberships } = await supabase
           .from("alumni_group_members")
           .select("group_id, role")
           .eq("user_id", user.id);
 
         const membershipMap = new Map(
           memberships?.map((m) => [m.group_id, m.role]) || []
         );
 
         const enrichedGroups = groupsData.map((group) => ({
           ...group,
           is_member: membershipMap.has(group.id),
           user_role: membershipMap.get(group.id) || null,
         }));
 
         setGroups(enrichedGroups);
       } else {
         setGroups(groupsData || []);
       }
     } catch (error) {
       console.error("Error fetching groups:", error);
     } finally {
       setIsLoading(false);
     }
   };
 
   const joinGroup = async (groupId: string) => {
     if (!user) {
       toast.error("Please sign in to join groups");
       return false;
     }
 
     try {
       const { error } = await supabase.from("alumni_group_members").insert({
         group_id: groupId,
         user_id: user.id,
         role: "member",
       });
 
       if (error) throw error;
 
       toast.success("Joined group successfully!");
       await fetchGroups();
       return true;
     } catch (error: any) {
       if (error.code === "23505") {
         toast.error("You're already a member of this group");
       } else {
         console.error("Error joining group:", error);
         toast.error("Failed to join group");
       }
       return false;
     }
   };
 
   const leaveGroup = async (groupId: string) => {
     if (!user) return false;
 
     try {
       const { error } = await supabase
         .from("alumni_group_members")
         .delete()
         .match({ group_id: groupId, user_id: user.id });
 
       if (error) throw error;
 
       toast.success("Left group");
       await fetchGroups();
       return true;
     } catch (error) {
       console.error("Error leaving group:", error);
       toast.error("Failed to leave group");
       return false;
     }
   };
 
   const createGroup = async (data: {
     name: string;
     description: string;
     field: string;
   }) => {
     if (!user) {
       toast.error("Please sign in to create groups");
       return null;
     }
 
     try {
       const { data: newGroup, error } = await supabase
         .from("alumni_groups")
         .insert({
           name: data.name,
           description: data.description,
           field: data.field,
           created_by: user.id,
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Auto-join as admin
       await supabase.from("alumni_group_members").insert({
         group_id: newGroup.id,
         user_id: user.id,
         role: "admin",
       });
 
       toast.success("Group created!");
       await fetchGroups();
       return newGroup;
     } catch (error) {
       console.error("Error creating group:", error);
       toast.error("Failed to create group");
       return null;
     }
   };
 
   useEffect(() => {
     fetchGroups();
   }, [user]);
 
   return {
     groups,
     isLoading,
     joinGroup,
     leaveGroup,
     createGroup,
     refetch: fetchGroups,
   };
 }