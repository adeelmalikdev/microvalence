 import { useState } from "react";
 import { motion } from "framer-motion";
import {
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  PartyPopper,
  Lightbulb,
  Heart,
  MoreHorizontal,
  Trash2,
  Link as LinkIcon,
  Repeat2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { AlumniPost } from "../hooks/useAlumniPosts";
import { AlumniComments } from "./AlumniComments";
 
type AlumniReactionType = Database["public"]["Enums"]["alumni_reaction_type"];

 const POST_TYPE_BADGES = {
   update: { label: "Update", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
   achievement: { label: "Achievement", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" },
   job_posting: { label: "Job", color: "bg-purple-500/20 text-purple-700 dark:text-purple-300" },
   advice: { label: "Advice", color: "bg-primary/20 text-primary" },
   event: { label: "Event", color: "bg-pink-500/20 text-pink-700 dark:text-pink-300" },
 };
 
 const REACTIONS = [
   { type: "like", icon: ThumbsUp, label: "Like" },
   { type: "celebrate", icon: PartyPopper, label: "Celebrate" },
   { type: "insightful", icon: Lightbulb, label: "Insightful" },
   { type: "support", icon: Heart, label: "Support" },
 ] as const;
 
 interface AlumniPostCardProps {
   post: AlumniPost;
   onDelete?: () => void;
 }
 
 export function AlumniPostCard({ post, onDelete }: AlumniPostCardProps) {
   const [likesCount, setLikesCount] = useState(post.likes_count);
  const [userReaction, setUserReaction] = useState<AlumniReactionType | null>(
    (post.user_reaction as AlumniReactionType) || null
  );
   const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [showRepostDialog, setShowRepostDialog] = useState(false);
  const [repostThoughts, setRepostThoughts] = useState("");
  const [isReposting, setIsReposting] = useState(false);
  const { user } = useAuth();

  const handleRepost = async () => {
    if (!user) {
      toast.error("Please sign in to repost");
      return;
    }
    setIsReposting(true);
    try {
      const repostContent = repostThoughts.trim()
        ? `${repostThoughts.trim()}\n\n---\n🔁 Reposted from ${authorName}:\n\n${post.content}`
        : `🔁 Reposted from ${authorName}:\n\n${post.content}`;

      const { error } = await supabase.from("alumni_posts").insert({
        author_id: user.id,
        content: repostContent,
        post_type: post.post_type,
        media_urls: post.media_urls || [],
        visibility: "public",
      });
      if (error) throw error;
      toast.success("Reposted successfully!");
      setShowRepostDialog(false);
      setRepostThoughts("");
    } catch (error) {
      console.error("Error reposting:", error);
      toast.error("Failed to repost");
    } finally {
      setIsReposting(false);
    }
  };
 
  const handleReaction = async (reactionType: AlumniReactionType) => {
     if (!user) {
       toast.error("Please sign in to react");
       return;
     }
 
     try {
       if (userReaction === reactionType) {
         // Remove reaction
         await supabase
           .from("alumni_post_reactions")
           .delete()
           .match({ post_id: post.id, user_id: user.id });
         setLikesCount((prev) => prev - 1);
         setUserReaction(null);
       } else if (userReaction) {
         // Update existing reaction
         await supabase
           .from("alumni_post_reactions")
           .update({ reaction_type: reactionType })
           .match({ post_id: post.id, user_id: user.id });
         setUserReaction(reactionType);
       } else {
         // Add new reaction
        const { error } = await supabase.from("alumni_post_reactions").insert({
           post_id: post.id,
           user_id: user.id,
           reaction_type: reactionType,
         });
        if (error) throw error;
         setLikesCount((prev) => prev + 1);
         setUserReaction(reactionType);
       }
       setShowReactions(false);
     } catch (error) {
       console.error("Error reacting to post:", error);
       toast.error("Failed to react");
     }
   };
 
   const handleDelete = async () => {
     if (!user || user.id !== post.author_id) return;
 
     try {
       const { error } = await supabase.from("alumni_posts").delete().eq("id", post.id);
       if (error) throw error;
       toast.success("Post deleted");
       onDelete?.();
     } catch (error) {
       console.error("Error deleting post:", error);
       toast.error("Failed to delete post");
     }
   };
 
   const authorName =
     post.author_profile?.full_name || `User ${post.author_id.slice(0, 8)}`;
   const authorInitials = authorName
     .split(" ")
     .map((n) => n[0])
     .join("")
     .toUpperCase()
     .slice(0, 2);
 
   const badge = POST_TYPE_BADGES[post.post_type];
   const activeReaction = REACTIONS.find((r) => r.type === userReaction);
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="bg-card/80 backdrop-blur-sm rounded-2xl border-2 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-all duration-300 overflow-hidden"
     >
       <div className="p-4">
         {/* Author Header */}
         <div className="flex items-start justify-between mb-3">
           <div className="flex gap-3">
             <Avatar className="h-12 w-12 border-2 border-primary/30">
               <AvatarImage src={post.author_profile?.avatar_url || undefined} />
               <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                 {authorInitials}
               </AvatarFallback>
             </Avatar>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">{authorName}</span>
                  {post.author_profile?.is_alumni ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/15 text-primary rounded-full text-xs font-semibold">
                      🎓 Alumni
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                      📚 Student
                    </span>
                  )}
                </div>
               <span className="text-sm text-muted-foreground">
                 {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
               </span>
             </div>
           </div>
 
           {user?.id === post.author_id && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                   <MoreHorizontal className="h-4 w-4" />
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                 <DropdownMenuItem
                   onClick={handleDelete}
                   className="text-destructive focus:text-destructive"
                 >
                   <Trash2 className="h-4 w-4 mr-2" />
                   Delete Post
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           )}
         </div>
 
         {/* Content */}
         <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
 
         {/* Media */}
         {post.media_urls && post.media_urls.length > 0 && (
           <div className="grid gap-2 mb-4">
             {post.media_urls.map((url, idx) => (
               <img
                 key={idx}
                 src={url}
                 alt={`Post media ${idx + 1}`}
                 className="rounded-lg w-full object-cover max-h-96"
               />
             ))}
           </div>
         )}
 
         {/* Stats */}
         <div className="flex items-center justify-between text-sm text-muted-foreground py-2 border-y border-border/50">
           <span>{likesCount} reactions</span>
           <button
             onClick={() => setShowComments(!showComments)}
             className="hover:text-primary transition-colors"
           >
             {commentsCount} comments
           </button>
         </div>
 
         {/* Actions */}
         <div className="flex items-center justify-between pt-2 relative">
           <div className="relative">
             <Button
               variant="ghost"
               size="sm"
               className={`gap-2 ${userReaction ? "text-primary" : "text-muted-foreground"}`}
              onClick={() => (userReaction ? handleReaction(userReaction as AlumniReactionType) : setShowReactions(!showReactions))}
               onMouseEnter={() => setShowReactions(true)}
             >
               {activeReaction ? (
                 <activeReaction.icon className="h-4 w-4" />
               ) : (
                 <ThumbsUp className="h-4 w-4" />
               )}
               {activeReaction?.label || "Like"}
             </Button>
 
             {/* Reaction Picker */}
             {showReactions && (
               <motion.div
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-full shadow-lg p-1 flex gap-1"
                 onMouseLeave={() => setShowReactions(false)}
               >
                 {REACTIONS.map((reaction) => (
                   <motion.button
                     key={reaction.type}
                     whileHover={{ scale: 1.2 }}
                     whileTap={{ scale: 0.9 }}
                      onClick={() => handleReaction(reaction.type as AlumniReactionType)}
                     className={`p-2 rounded-full hover:bg-muted transition-colors ${
                       userReaction === reaction.type ? "bg-primary/20" : ""
                     }`}
                     title={reaction.label}
                   >
                     <reaction.icon className="h-5 w-5" />
                   </motion.button>
                 ))}
               </motion.div>
             )}
           </div>
 
           <Button
             variant="ghost"
             size="sm"
             className="gap-2 text-muted-foreground"
             onClick={() => setShowComments(!showComments)}
           >
             <MessageCircle className="h-4 w-4" />
             Comment
           </Button>
 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem
                onClick={() => {
                  const url = `${window.location.origin}/student/alumni?post=${post.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard");
                }}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowRepostDialog(true)}>
                <Repeat2 className="h-4 w-4 mr-2" />
                Repost with your thoughts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
 
           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
             <Bookmark className="h-4 w-4" />
           </Button>
         </div>
       </div>
 
       {/* Comments Section */}
       {showComments && (
         <AlumniComments
           postId={post.id}
           onCommentAdded={() => setCommentsCount((c) => c + 1)}
         />
       )}
      {/* Repost Dialog */}
      <Dialog open={showRepostDialog} onOpenChange={setShowRepostDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Repost with your thoughts</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Add your thoughts... (optional)"
            value={repostThoughts}
            onChange={(e) => setRepostThoughts(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50 text-sm">
            <div className="flex items-center gap-2 mb-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author_profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{authorName}</span>
            </div>
            <p className="text-muted-foreground line-clamp-3">{post.content}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRepostDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRepost} disabled={isReposting}>
              {isReposting ? "Reposting..." : "Repost"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}