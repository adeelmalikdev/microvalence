import { useState, useEffect } from "react";
import { Send, Trash2, Pin, BarChart3, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useGroupChat } from "../hooks/useGroupChat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PollCreate } from "@/components/messaging/PollCreate";
import { PollDisplay } from "@/components/messaging/PollDisplay";
import { toast } from "sonner";

interface GroupChatProps {
  groupId: string;
  isAdmin?: boolean;
  adminOnlyMessaging?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: string[];
  creator_id: string;
  is_active: boolean;
  created_at: string;
}

export function GroupChat({ groupId, isAdmin, adminOnlyMessaging }: GroupChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showPollCreate, setShowPollCreate] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const { messages, isLoading, isSending, sendMessage, deleteMessage, pinMessage, messagesEndRef } =
    useGroupChat(groupId);
  const { user, profile } = useAuth();

  // Track when initial load is complete to prevent animations from scrolling
  useEffect(() => {
    if (!isLoading && messages.length >= 0) {
      // Small delay to let the DOM settle before enabling animations
      const timer = setTimeout(() => setInitialLoadDone(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const canSendMessage = !adminOnlyMessaging || isAdmin;

  useEffect(() => {
    fetchPolls();
    const channel = supabase
      .channel(`group-polls-${groupId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "polls", filter: `group_id=eq.${groupId}` }, () => {
        fetchPolls();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [groupId]);

  const fetchPolls = async () => {
    const { data } = await supabase
      .from("polls")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    if (data) setPolls(data as any);
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !mediaFile) return;

    let mediaUrl: string | undefined;
    if (mediaFile) {
      const ext = mediaFile.name.split(".").pop();
      const path = `groups/${groupId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("alumni-media").upload(path, mediaFile);
      if (error) {
        toast.error("Failed to upload media");
        return;
      }
      const { data: urlData } = supabase.storage.from("alumni-media").getPublicUrl(path);
      mediaUrl = urlData.publicUrl;
    }

    const success = await sendMessage(newMessage, mediaUrl);
    if (success) {
      setNewMessage("");
      setMediaFile(null);
      setMediaPreview(null);
    }
  };

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File must be under 10MB");
        return;
      }
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userInitials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  const pinnedMessages = messages.filter((m) => (m as any).is_pinned);

  return (
    <div className="flex flex-col h-[500px] bg-card/50 rounded-2xl border-2 border-primary/20 overflow-hidden">
      {/* Pinned messages bar */}
      {pinnedMessages.length > 0 && (
        <div className="px-4 py-2 border-b bg-primary/5 flex items-center gap-2 shrink-0">
          <Pin className="h-3 w-3 text-primary shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            📌 {pinnedMessages[pinnedMessages.length - 1]?.message}
          </span>
        </div>
      )}

      {/* Active polls */}
      {polls.filter((p) => p.is_active).length > 0 && (
        <div className="px-4 py-2 border-b max-h-48 overflow-y-auto shrink-0">
          {polls.filter((p) => p.is_active).map((poll) => (
            <PollDisplay key={poll.id} poll={poll} />
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-48" />
              </div>
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = msg.sender_id === user?.id;
              const senderName = msg.sender_profile?.full_name || `User ${msg.sender_id.slice(0, 8)}`;
              const initials = senderName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
              const isPinned = (msg as any).is_pinned;
              const mediaUrl = (msg as any).media_url;

              return (
                <motion.div
                  key={msg.id}
                  initial={initialLoadDone ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={msg.sender_profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">{initials}</AvatarFallback>
                  </Avatar>

                  <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 relative ${
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      } ${isPinned ? "ring-1 ring-primary/50" : ""}`}
                    >
                      {isPinned && (
                        <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] h-4 px-1">
                          <Pin className="h-2 w-2 mr-0.5" /> Pinned
                        </Badge>
                      )}
                      {!isOwn && (
                        <span className="text-xs font-medium opacity-70 block mb-1">{senderName}</span>
                      )}
                      {mediaUrl && (
                        <img src={mediaUrl} alt="Media" className="rounded-lg max-h-48 mb-2 cursor-pointer" onClick={() => window.open(mediaUrl, "_blank")} />
                      )}
                      {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}

                      {/* Admin actions */}
                      {isAdmin && (
                        <div className="absolute -top-3 right-0 hidden group-hover:flex gap-0.5 bg-background rounded-full shadow-sm border p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => pinMessage(msg.id, !isPinned)}
                            title={isPinned ? "Unpin" : "Pin"}
                          >
                            <Pin className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => deleteMessage(msg.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {!isAdmin && isOwn && (
                        <div className="absolute -top-3 right-0 hidden group-hover:flex gap-0.5 bg-background rounded-full shadow-sm border p-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive hover:text-destructive"
                            onClick={() => deleteMessage(msg.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block px-2">
                      {format(new Date(msg.created_at || ""), "HH:mm")}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Poll create */}
      {showPollCreate && (
        <div className="px-4 py-2 border-t shrink-0">
          <PollCreate
            groupId={groupId}
            onCreated={() => { setShowPollCreate(false); fetchPolls(); }}
            onCancel={() => setShowPollCreate(false)}
          />
        </div>
      )}

      {/* Media preview */}
      {mediaPreview && (
        <div className="px-4 py-2 border-t shrink-0">
          <div className="relative inline-block">
            <img src={mediaPreview} alt="Preview" className="h-20 rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
              onClick={() => { setMediaFile(null); setMediaPreview(null); }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-background/50 shrink-0">
        {canSendMessage ? (
          <div className="flex gap-2">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-muted/50 border-primary/20"
                disabled={!user}
              />
              <input
                type="file"
                id={`group-media-${groupId}`}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleMediaSelect}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.getElementById(`group-media-${groupId}`)?.click()}
                title="Attach media"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              {(isAdmin) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPollCreate(!showPollCreate)}
                  title="Create poll"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={handleSend}
                disabled={(!newMessage.trim() && !mediaFile) || isSending || !user}
                size="icon"
                className="bg-primary hover:bg-primary/90 shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-2">
            Only admins can send messages in this group
          </p>
        )}
      </div>
    </div>
  );
}
