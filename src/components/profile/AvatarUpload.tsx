import { useState, useRef, useCallback } from "react";
import { Camera, Loader2, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ImageCropDialog } from "./ImageCropDialog";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB before crop
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUpload?: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export function AvatarUpload({ currentUrl, onUpload, size = "lg" }: AvatarUploadProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("avatar.jpg");

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user?.id) return;
      event.target.value = "";

      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: "destructive", title: "File too large", description: "Please select an image under 5MB." });
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ variant: "destructive", title: "Invalid file type", description: "Please upload JPEG, PNG, WebP, or GIF." });
        return;
      }

      setSelectedFileName(file.name);
      const objectUrl = URL.createObjectURL(file);
      setRawImageSrc(objectUrl);
      setCropDialogOpen(true);
    },
    [user?.id, toast]
  );

  const handleCroppedImage = useCallback(
    async (croppedBlob: Blob) => {
      if (!user?.id) return;

      const preview = URL.createObjectURL(croppedBlob);
      setPreviewUrl(preview);
      setIsUploading(true);

      try {
        const timestamp = Date.now();
        const fileExt = selectedFileName.split(".").pop() || "jpg";
        const fileName = `${user.id}/avatar_${timestamp}.${fileExt}`;

        // Delete old avatar
        if (currentUrl) {
          const oldPath = currentUrl.split("/avatars/").pop();
          if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);
        }

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, croppedBlob, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        const publicUrl = urlData.publicUrl;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        onUpload?.(publicUrl);
        toast({ title: "Avatar updated", description: "Your profile picture has been updated." });
      } catch (error) {
        console.error("Avatar upload error:", error);
        toast({ variant: "destructive", title: "Upload failed", description: "Failed to upload avatar." });
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
        setRawImageSrc(null);
      }
    },
    [user?.id, currentUrl, onUpload, toast, selectedFileName, rawImageSrc]
  );

  const handleRemoveAvatar = async () => {
    if (!user?.id || !currentUrl) return;
    setIsUploading(true);
    try {
      const oldPath = currentUrl.split("/avatars/").pop();
      if (oldPath) await supabase.storage.from("avatars").remove([oldPath]);

      await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      setPreviewUrl(null);
      onUpload?.("");
      toast({ title: "Avatar removed", description: "Your profile picture has been removed." });
    } catch (error) {
      console.error("Avatar remove error:", error);
      toast({ variant: "destructive", title: "Remove failed", description: "Failed to remove avatar." });
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || currentUrl;
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={displayUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="text-lg">
            {initials || <User className="h-8 w-8" />}
          </AvatarFallback>
        </Avatar>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        )}

        {displayUrl && !isUploading && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full"
            onClick={handleRemoveAvatar}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile picture"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        <Camera className="h-4 w-4 mr-2" />
        {displayUrl ? "Change Photo" : "Upload Photo"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        JPEG, PNG, WebP or GIF. Max 5MB.
      </p>

      {rawImageSrc && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open);
            if (!open && rawImageSrc) {
              URL.revokeObjectURL(rawImageSrc);
              setRawImageSrc(null);
            }
          }}
          imageSrc={rawImageSrc}
          onCropComplete={handleCroppedImage}
        />
      )}
    </div>
  );
}
