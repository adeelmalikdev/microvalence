import { useEffect, useRef } from "react";
import { MessageSquare, Pin, Ban, MoreVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";

interface ChatWindowProps {
  conversationId: string | undefined;
  otherUserName: string;
  otherUserAvatar?: string | null;
  opportunityTitle: string;
  companyName: string;
  companyLogo?: string | null;
  isPinned?: boolean;
  isBlocked?: boolean;
  onTogglePin?: (pinned: boolean) => void;
  onToggleBlock?: (blocked: boolean) => void;
}

export function ChatWindow({
  conversationId,
  otherUserName,
  otherUserAvatar,
  opportunityTitle,
  companyName,
  companyLogo,
  isPinned,
  isBlocked,
  onTogglePin,
  onToggleBlock,
}: ChatWindowProps) {
  const { user } = useAuth();
  const { messages, isLoading, sendMessage, markAsRead } = useMessages(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when viewing
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAsRead.mutate();
    }
  }, [conversationId, messages.length]);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  };

  // Auto-scroll to bottom when opening conversation
  useEffect(() => {
    if (conversationId) {
      scrollToBottom("auto");
    }
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      scrollToBottom("smooth");
    }
  }, [messages.length, isLoading]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            Select a Conversation
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const displayName = otherUserName.trim() || "Unknown user";
  const displaySubtitle =
    opportunityTitle.trim() || companyName.trim()
      ? `${opportunityTitle || "Internship"} • ${companyName || "Valence"}`
      : "Internship conversation";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0">
      {/* Header - always visible */}
      <div className="border-b px-4 py-3 shrink-0 bg-background z-10 flex items-center gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={otherUserAvatar || companyLogo || undefined} alt={displayName} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-foreground truncate text-sm">{displayName}</h2>
            {isPinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
            {isBlocked && <Ban className="h-3 w-3 text-destructive shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {displaySubtitle}
          </p>
        </div>

        {(onTogglePin || onToggleBlock) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {onTogglePin && (
                <DropdownMenuItem onClick={() => onTogglePin(!isPinned)}>
                  <Pin className="h-4 w-4 mr-2" />
                  {isPinned ? "Unpin Chat" : "Pin Chat"}
                </DropdownMenuItem>
              )}
              {onToggleBlock && (
                <DropdownMenuItem
                  onClick={() => onToggleBlock(!isBlocked)}
                  className={isBlocked ? "" : "text-destructive"}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {isBlocked ? "Unblock" : "Block User"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Blocked banner */}
      {isBlocked && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs text-center shrink-0">
          This conversation is blocked. You won't receive new messages.
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                <Skeleton className="h-16 w-48 rounded-lg" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              isOwn={message.sender_id === user?.id}
              timestamp={message.created_at}
              isRead={!!message.read_at}
            />
          ))
        )}
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input */}
      <MessageInput
        onSend={(text) => sendMessage.mutate(text)}
        isLoading={sendMessage.isPending}
        disabled={isBlocked}
      />
    </div>
  );
}
