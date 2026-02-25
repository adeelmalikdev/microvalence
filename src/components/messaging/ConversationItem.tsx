import { Pin, Ban, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Conversation } from "@/hooks/useConversations";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onTogglePin?: (id: string, pinned: boolean) => void;
  onToggleBlock?: (id: string, blocked: boolean) => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  onClick,
  onTogglePin,
  onToggleBlock,
}: ConversationItemProps) {
  const initials = conversation.other_user_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "group relative w-full text-left p-4 border-b transition-colors hover:bg-muted/50 cursor-pointer",
        isSelected && "bg-muted",
        conversation.is_blocked && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3" onClick={onClick}>
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarImage
            src={conversation.other_user_avatar || conversation.company_logo || undefined}
            alt={conversation.other_user_name}
          />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="font-medium text-foreground truncate text-sm">
              {conversation.other_user_name}
            </span>
            {conversation.is_pinned && (
              <Pin className="h-3 w-3 text-primary shrink-0" />
            )}
            {conversation.is_blocked && (
              <Ban className="h-3 w-3 text-destructive shrink-0" />
            )}
            {conversation.unread_count > 0 && (
              <Badge variant="default" className="h-5 min-w-5 p-0 flex items-center justify-center text-xs shrink-0">
                {conversation.unread_count}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {conversation.opportunity_title} • {conversation.company_name}
          </p>
          {conversation.last_message && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {conversation.last_message}
            </p>
          )}
        </div>
      </div>

      {/* Actions menu */}
      {(onTogglePin || onToggleBlock) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:opacity-100 focus:opacity-100"
              style={{ opacity: isSelected ? 1 : undefined }}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {onTogglePin && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(conversation.id, !conversation.is_pinned);
                }}
              >
                <Pin className="h-4 w-4 mr-2" />
                {conversation.is_pinned ? "Unpin" : "Pin"}
              </DropdownMenuItem>
            )}
            {onToggleBlock && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBlock(conversation.id, !conversation.is_blocked);
                }}
                className={conversation.is_blocked ? "" : "text-destructive"}
              >
                <Ban className="h-4 w-4 mr-2" />
                {conversation.is_blocked ? "Unblock" : "Block"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
