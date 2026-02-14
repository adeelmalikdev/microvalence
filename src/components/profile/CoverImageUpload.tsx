import { useState, useRef } from "react";
import { Camera, Loader2, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for cover images

interface CoverImageUploadProps {
  currentUrl?: string | null;
  onUpload?: (url: string) => void;
}

export function CoverImageUpload({ currentUrl, onUpload }: CoverImageUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;
    event.target.value = "";

    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: "destructive", title: "File too large", description: "Cover image must be under 5MB." });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please upload an image file." });
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/cover_${Date.now()}.${fileExt}`;

      if (currentUrl) {
        const oldPath = currentUrl.split("/covers/").pop();
        if (oldPath) await supabase.storage.from("covers").remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, { cacheControl: "3600", upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("covers").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cover_image: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      onUpload?.(urlData.publicUrl);
      toast({ title: "Cover updated", description: "Your cover image has been updated." });
    } catch (error) {
      console.error("Cover upload error:", error);
      toast({ variant: "destructive", title: "Upload failed", description: "Failed to upload cover image." });
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.id || !currentUrl) return;
    setIsUploading(true);
    try {
      const oldPath = currentUrl.split("/covers/").pop();
      if (oldPath) await supabase.storage.from("covers").remove([oldPath]);
      await supabase.from("profiles").update({ cover_image: null }).eq("user_id", user.id);
      setPreviewUrl(null);
      onUpload?.("");
      toast({ title: "Cover removed" });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove cover image" });
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="relative w-full h-40 sm:h-52 rounded-t-lg overflow-hidden bg-gradient-to-r from-primary/20 to-primary/5">
      {displayUrl ? (
        <img src={displayUrl} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1 text-xs opacity-80 hover:opacity-100"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Camera className="h-3 w-3" />
          {displayUrl ? "Change" : "Add Cover"}
        </Button>
        {displayUrl && !isUploading && (
          <Button
            variant="destructive"
            size="sm"
            className="text-xs opacity-80 hover:opacity-100"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
