import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Conversation {
  id: string;
  application_id: string;
  student_id: string;
  recruiter_id: string;
  created_at: string;
  updated_at: string;
  other_user_name: string;
  other_user_avatar: string | null;
  opportunity_title: string;
  company_name: string;
  company_logo: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  is_pinned: boolean;
  is_blocked: boolean;
}

export function useConversations() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ["conversations", user?.id, role],
    queryFn: async () => {
      if (!user) return [];

      const { data: conversations, error } = await supabase
        .from("conversations")
        .select(`
          *,
          application:applications!inner(
            opportunity:opportunities!inner(title, company_name, company_logo, recruiter_id),
            student_id
          )
        `)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      if (!conversations?.length) return [];

      // Get other user profiles
      const otherUserIds = conversations.map((c: any) =>
        role === "student" ? c.recruiter_id : c.student_id
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url, company_logo")
        .in("user_id", otherUserIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      // Get last messages and unread counts
      const conversationIds = conversations.map((c: any) => c.id);

      const { data: lastMessages } = await supabase
        .from("messages")
        .select("conversation_id, content, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false });

      const lastMessageMap = new Map<string, { content: string; created_at: string }>();
      lastMessages?.forEach((m) => {
        if (!lastMessageMap.has(m.conversation_id)) {
          lastMessageMap.set(m.conversation_id, { content: m.content, created_at: m.created_at });
        }
      });

      // Get unread counts
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", conversationIds)
        .neq("sender_id", user.id)
        .is("read_at", null);

      const unreadCountMap = new Map<string, number>();
      unreadMessages?.forEach((m) => {
        unreadCountMap.set(m.conversation_id, (unreadCountMap.get(m.conversation_id) || 0) + 1);
      });

      // Map to enriched conversations
      const mapped = conversations.map((conv: any): Conversation => {
        const otherUserId = role === "student" ? conv.recruiter_id : conv.student_id;
        const otherProfile = profileMap.get(otherUserId);
        const lastMessage = lastMessageMap.get(conv.id);

        const isPinned = role === "student" ? conv.is_pinned_student : conv.is_pinned_recruiter;
        const isBlocked = role === "student" ? conv.is_blocked_by_student : conv.is_blocked_by_recruiter;

        return {
          id: conv.id,
          application_id: conv.application_id,
          student_id: conv.student_id,
          recruiter_id: conv.recruiter_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          other_user_name: otherProfile?.full_name || otherProfile?.email || "Unknown",
          other_user_avatar: otherProfile?.avatar_url || null,
          opportunity_title: conv.application.opportunity.title,
          company_name: conv.application.opportunity.company_name,
          company_logo: conv.application.opportunity.company_logo || otherProfile?.company_logo || null,
          last_message: lastMessage?.content || null,
          last_message_at: lastMessage?.created_at || null,
          unread_count: unreadCountMap.get(conv.id) || 0,
          is_pinned: !!isPinned,
          is_blocked: !!isBlocked,
        };
      });

      // Sort: pinned first, then by last activity
      mapped.sort((a: Conversation, b: Conversation) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return 0; // already sorted by updated_at from DB
      });

      return mapped;
    },
    enabled: !!user && !!role,
  });
}

export function useConversationByApplication(applicationId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["conversation", "application", applicationId],
    queryFn: async () => {
      if (!applicationId) return null;

      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("application_id", applicationId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!applicationId,
  });
}

export function useConversationActions() {
  const { role } = useAuth();
  const queryClient = useQueryClient();

  const togglePin = useMutation({
    mutationFn: async ({ conversationId, pinned }: { conversationId: string; pinned: boolean }) => {
      const field = role === "student" ? "is_pinned_student" : "is_pinned_recruiter";
      const { error } = await supabase
        .from("conversations")
        .update({ [field]: pinned } as any)
        .eq("id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const toggleBlock = useMutation({
    mutationFn: async ({ conversationId, blocked }: { conversationId: string; blocked: boolean }) => {
      const field = role === "student" ? "is_blocked_by_student" : "is_blocked_by_recruiter";
      const { error } = await supabase
        .from("conversations")
        .update({ [field]: blocked } as any)
        .eq("id", conversationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return { togglePin, toggleBlock };
}
