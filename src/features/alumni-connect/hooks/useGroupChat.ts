import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type MessageRow = Database["public"]["Tables"]["alumni_group_messages"]["Row"];

export interface GroupMessage extends MessageRow {
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useGroupChat(groupId: string) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const { data: messagesData, error } = await supabase
        .from("alumni_group_messages")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (messagesData && messagesData.length > 0) {
        const senderIds = [...new Set(messagesData.map((m) => m.sender_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", senderIds);

        const enrichedMessages = messagesData.map((msg) => ({
          ...msg,
          sender_profile: profiles?.find((p) => p.user_id === msg.sender_id) || null,
        }));

        setMessages(enrichedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string, mediaUrl?: string) => {
    if ((!content.trim() && !mediaUrl) || !user) {
      if (!user) toast.error("Please sign in to send messages");
      return false;
    }

    setIsSending(true);
    try {
      const insertData: any = {
        group_id: groupId,
        sender_id: user.id,
        message: content.trim() || "",
      };
      if (mediaUrl) insertData.media_url = mediaUrl;

      const { error } = await supabase.from("alumni_group_messages").insert(insertData);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("alumni_group_messages")
        .delete()
        .eq("id", messageId);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  };

  const pinMessage = async (messageId: string, pinned: boolean) => {
    try {
      const { error } = await supabase
        .from("alumni_group_messages")
        .update({ is_pinned: pinned } as any)
        .eq("id", messageId);
      if (error) throw error;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: pinned } as any : m))
      );
      toast.success(pinned ? "Message pinned" : "Message unpinned");
    } catch {
      toast.error("Failed to update pin");
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alumni_group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as MessageRow;
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .eq("user_id", newMessage.sender_id)
            .single();

          const enrichedMessage: GroupMessage = {
            ...newMessage,
            sender_profile: profile,
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, enrichedMessage];
          });
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "alumni_group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  useEffect(() => {
    if (!isLoading) scrollToBottom();
  }, [isLoading]);

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
    deleteMessage,
    pinMessage,
    messagesEndRef,
  };
}
