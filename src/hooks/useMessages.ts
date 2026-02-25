import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  media_url?: string | null;
  is_pinned?: boolean;
}

export function useMessages(conversationId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId && !!user,
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        queryClient.setQueryData(
          ["messages", conversationId],
          (old: Message[] = []) => {
            if (old.some((m) => m.id === (payload.new as Message).id)) return old;
            return [...old, payload.new as Message];
          }
        );
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        queryClient.setQueryData(
          ["messages", conversationId],
          (old: Message[] = []) =>
            old.map((m) => m.id === (payload.new as Message).id ? (payload.new as Message) : m)
        );
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        queryClient.setQueryData(
          ["messages", conversationId],
          (old: Message[] = []) => old.filter((m) => m.id !== (payload.old as any).id)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, user, queryClient]);

  // Send message mutation with optimistic update
  const sendMessage = useMutation({
    mutationFn: async ({ content, mediaUrl }: { content: string; mediaUrl?: string }) => {
      if (!conversationId || !user) throw new Error("Not authenticated");
      const insertData: any = {
        conversation_id: conversationId,
        sender_id: user.id,
        content: content || "",
      };
      if (mediaUrl) insertData.media_url = mediaUrl;
      const { error } = await supabase.from("messages").insert(insertData);
      if (error) throw error;
    },
    onMutate: async ({ content, mediaUrl }) => {
      if (!conversationId || !user) return;
      await queryClient.cancelQueries({ queryKey: ["messages", conversationId] });
      const previous = queryClient.getQueryData<Message[]>(["messages", conversationId]);
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        read_at: null,
        created_at: new Date().toISOString(),
        media_url: mediaUrl || null,
        is_pinned: false,
      };
      queryClient.setQueryData<Message[]>(
        ["messages", conversationId],
        (old = []) => [...old, optimisticMessage]
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous && conversationId) {
        queryClient.setQueryData(["messages", conversationId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Pin message
  const pinMessage = useMutation({
    mutationFn: async ({ messageId, pinned }: { messageId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_pinned: pinned } as any)
        .eq("id", messageId);
      if (error) throw error;
    },
    onSuccess: (_, { pinned }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      toast.success(pinned ? "Message pinned" : "Message unpinned");
    },
  });

  // Delete message (own messages only for now - no RLS policy for delete on messages table)
  // Note: Messages table doesn't have DELETE policy, so this won't work via client
  // We mark it as a stub for future use

  // Mark as read mutation
  const markAsRead = useMutation({
    mutationFn: async () => {
      if (!conversationId || !user) return;
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages: query.data ?? [],
    isLoading: query.isLoading,
    sendMessage,
    markAsRead,
    pinMessage,
  };
}
