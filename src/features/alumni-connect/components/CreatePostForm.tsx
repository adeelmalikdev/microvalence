import { useState, useRef } from "react";
import { Image, Send, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const POST_TYPES = [
  { value: "update", label: "Update", emoji: "📝" },
  { value: "achievement", label: "Achievement", emoji: "🏆" },
  { value: "job_posting", label: "Job Posting", emoji: "💼" },
  { value: "advice", label: "Advice", emoji: "💡" },
  { value: "event", label: "Event", emoji: "📅" },
] as const;

const ACCEPTED_FILE_TYPES = "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<typeof POST_TYPES[number]["value"]>("update");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        continue;
      }
      validFiles.push(file);
    }

    if (mediaFiles.length + validFiles.length > 4) {
      toast.error("Maximum 4 media files per post");
      return;
    }

    setMediaFiles((prev) => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setMediaPreviews((prev) => [...prev, url]);
    });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    URL.revokeObjectURL(mediaPreviews[index]);
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (): Promise<string[]> => {
    if (mediaFiles.length === 0 || !user) return [];

    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of mediaFiles) {
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
          .from("alumni-media")
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("alumni-media")
          .getPublicUrl(filePath);

        urls.push(urlData.publicUrl);
      }
    } finally {
      setIsUploading(false);
    }

    return urls;
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    if (!user) {
      toast.error("Please sign in to post");
      return;
    }

    setIsLoading(true);
    try {
      // Upload media first
      const mediaUrls = await uploadMedia();

      const { error } = await supabase.from("alumni_posts").insert({
        author_id: user.id,
        content: content.trim(),
        post_type: postType,
        media_urls: mediaUrls.length > 0 ? mediaUrls : [],
      });

      if (error) throw error;

      // Cleanup previews
      mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
      setContent("");
      setPostType("update");
      setMediaFiles([]);
      setMediaPreviews([]);
      setIsExpanded(false);
      toast.success("Post created successfully!");
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border-2 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)] p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 border-2 border-primary/30">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (!isExpanded && e.target.value.length > 0) {
                setIsExpanded(true);
              }
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder="Share an update, achievement, or advice..."
            className="min-h-[60px] resize-none bg-background/50 border-primary/20 focus:border-primary/50 transition-colors"
          />

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Post Type Selector */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {POST_TYPES.map((type) => (
                    <motion.button
                      key={type.value}
                      type="button"
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        postType === type.value
                          ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPostType(type.value)}
                    >
                      {type.emoji} {type.label}
                    </motion.button>
                  ))}
                </div>

                {/* Media Previews */}
                {mediaPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {mediaPreviews.map((preview, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
                        {mediaFiles[idx]?.type.startsWith("video/") ? (
                          <video
                            src={preview}
                            className="w-full h-32 object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={preview}
                            alt={`Media ${idx + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_TYPES}
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={mediaFiles.length >= 4 || isLoading}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    {mediaFiles.length > 0
                      ? `${mediaFiles.length}/4 Media`
                      : "Add Media"}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsExpanded(false);
                        setContent("");
                        mediaPreviews.forEach((url) => URL.revokeObjectURL(url));
                        setMediaFiles([]);
                        setMediaPreviews([]);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!content.trim() || isLoading || isUploading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                    >
                      {isLoading || isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isUploading ? "Uploading..." : "Posting..."}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Post
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
