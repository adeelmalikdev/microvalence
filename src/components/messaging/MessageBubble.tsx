import { format } from "date-fns";
import { Check, CheckCheck, Pin, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MessageBubbleProps {
  content: string;
  isOwn: boolean;
  timestamp: string;
  isRead: boolean;
  mediaUrl?: string | null;
  isPinned?: boolean;
  onPin?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function MessageBubble({
  content,
  isOwn,
  timestamp,
  isRead,
  mediaUrl,
  isPinned,
  onPin,
  onDelete,
  showActions,
}: MessageBubbleProps) {
  return (
    <div className={cn("flex mb-3 group", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 relative",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
          isPinned && "ring-1 ring-primary/50"
        )}
      >
        {isPinned && (
          <Badge variant="secondary" className="absolute -top-2 -right-2 text-[10px] h-4 px-1">
            <Pin className="h-2 w-2 mr-0.5" /> Pinned
          </Badge>
        )}

        {/* Action buttons on hover */}
        {showActions && (onPin || onDelete) && (
          <div className="absolute -top-3 right-0 hidden group-hover:flex gap-0.5 bg-background rounded-full shadow-sm border p-0.5">
            {onPin && (
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onPin} title={isPinned ? "Unpin" : "Pin"}>
                <Pin className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive" onClick={onDelete} title="Delete">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {mediaUrl && (
          <img
            src={mediaUrl}
            alt="Media"
            className="rounded-lg max-h-48 mb-2 cursor-pointer"
            onClick={() => window.open(mediaUrl, "_blank")}
          />
        )}
        {content && <p className="text-sm whitespace-pre-wrap break-words">{content}</p>}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className={cn("text-xs", isOwn ? "opacity-70" : "text-muted-foreground")}>
            {format(new Date(timestamp), "HH:mm")}
          </span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="h-3 w-3 text-blue-400" />
            ) : (
              <Check className="h-3 w-3 opacity-50" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
