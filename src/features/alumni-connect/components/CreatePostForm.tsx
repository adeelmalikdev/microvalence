 import { useState } from "react";
 import { Image, Send, X } from "lucide-react";
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
 
 interface CreatePostFormProps {
   onPostCreated?: () => void;
 }
 
 export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
   const [content, setContent] = useState("");
   const [postType, setPostType] = useState<typeof POST_TYPES[number]["value"]>("update");
   const [isLoading, setIsLoading] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);
   const { user, profile } = useAuth();
 
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
       const { error } = await supabase.from("alumni_posts").insert({
         author_id: user.id,
         content: content.trim(),
         post_type: postType,
       });
 
       if (error) throw error;
 
       setContent("");
       setPostType("update");
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
 
                 {/* Actions */}
                 <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                   <Button
                     variant="ghost"
                     size="sm"
                     className="text-muted-foreground hover:text-primary"
                     disabled
                   >
                     <Image className="h-4 w-4 mr-2" />
                     Add Media
                   </Button>
 
                   <div className="flex gap-2">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => {
                         setIsExpanded(false);
                         setContent("");
                       }}
                     >
                       <X className="h-4 w-4 mr-1" />
                       Cancel
                     </Button>
                     <Button
                       onClick={handleSubmit}
                       disabled={!content.trim() || isLoading}
                       className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                     >
                       <Send className="h-4 w-4 mr-2" />
                       {isLoading ? "Posting..." : "Post"}
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