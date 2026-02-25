import { useState, KeyboardEvent } from "react";
import { Send, Image as ImageIcon, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessageInputProps {
  onSend: (message: string, mediaUrl?: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  onPollCreate?: () => void;
}

export function MessageInput({ onSend, isLoading, disabled, onPollCreate }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSend = async () => {
    if ((!message.trim() && !mediaFile) || isLoading || disabled) return;

    let mediaUrl: string | undefined;
    if (mediaFile) {
      setIsUploading(true);
      try {
        const ext = mediaFile.name.split(".").pop();
        const path = `dm/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("alumni-media").upload(path, mediaFile);
        if (error) throw error;
        const { data } = supabase.storage.from("alumni-media").getPublicUrl(path);
        mediaUrl = data.publicUrl;
      } catch {
        toast.error("Failed to upload media");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    onSend(message.trim(), mediaUrl);
    setMessage("");
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  if (disabled) {
    return (
      <div className="border-t p-3 shrink-0 bg-background">
        <p className="text-sm text-muted-foreground text-center py-2">
          This conversation is blocked
        </p>
      </div>
    );
  }

  return (
    <div className="border-t bg-background shrink-0">
      {mediaPreview && (
        <div className="px-4 pt-3">
          <div className="relative inline-block">
            <img src={mediaPreview} alt="Preview" className="h-16 rounded-lg" />
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
      <div className="flex gap-2 p-4 items-end">
        <input
          type="file"
          id="dm-media-input"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleMediaSelect}
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => document.getElementById("dm-media-input")?.click()}
          disabled={isLoading || isUploading}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        {onPollCreate && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onPollCreate}
            disabled={isLoading}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        )}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="min-h-[44px] max-h-32 resize-none"
          rows={1}
          disabled={isLoading || isUploading}
        />
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && !mediaFile) || isLoading || isUploading}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
