 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 import { Achievement, RARITY_COLORS } from "@/hooks/useGamification";
 import { Lock } from "lucide-react";
 import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
 } from "@/components/ui/tooltip";
 
 interface AchievementBadgeProps {
   achievement: Achievement;
   isUnlocked: boolean;
   unlockedAt?: string;
   size?: "sm" | "md" | "lg";
   showTooltip?: boolean;
 }
 
 const sizeClasses = {
   sm: "w-12 h-12 text-lg",
   md: "w-16 h-16 text-2xl",
   lg: "w-20 h-20 text-3xl",
 };
 
 export function AchievementBadge({
   achievement,
   isUnlocked,
   unlockedAt,
   size = "md",
   showTooltip = true,
 }: AchievementBadgeProps) {
   const rarityColors = RARITY_COLORS[achievement.rarity];
 
   const badge = (
     <motion.div
       className={cn(
         "relative rounded-full flex items-center justify-center border-2 transition-all",
         sizeClasses[size],
         isUnlocked
           ? cn(rarityColors.bg, rarityColors.border, "cursor-pointer")
           : "bg-muted/50 border-border/50 cursor-not-allowed"
       )}
       whileHover={isUnlocked ? { scale: 1.1, rotate: 5 } : {}}
       whileTap={isUnlocked ? { scale: 0.95 } : {}}
     >
       {isUnlocked ? (
         <span className="select-none">{achievement.icon}</span>
       ) : (
         <Lock className="w-1/3 h-1/3 text-muted-foreground/50" />
       )}
 
       {/* Rarity glow effect for unlocked achievements */}
       {isUnlocked && achievement.rarity !== "common" && (
         <motion.div
           className={cn(
             "absolute inset-0 rounded-full opacity-50",
             achievement.rarity === "legendary" && "bg-warning/20",
             achievement.rarity === "epic" && "bg-secondary/20",
             achievement.rarity === "rare" && "bg-info/20",
             achievement.rarity === "uncommon" && "bg-success/20"
           )}
           animate={{
             scale: [1, 1.2, 1],
             opacity: [0.3, 0.5, 0.3],
           }}
           transition={{
             duration: 2,
             repeat: Infinity,
             ease: "easeInOut",
           }}
         />
       )}
     </motion.div>
   );
 
   if (!showTooltip) return badge;
 
   return (
     <Tooltip>
       <TooltipTrigger asChild>{badge}</TooltipTrigger>
       <TooltipContent side="top" className="max-w-xs">
         <div className="space-y-1">
           <div className="flex items-center gap-2">
             <span className="font-semibold">{achievement.title}</span>
             <span
               className={cn(
                 "text-xs px-1.5 py-0.5 rounded capitalize",
                 rarityColors.bg,
                 rarityColors.text
               )}
             >
               {achievement.rarity}
             </span>
           </div>
           <p className="text-sm text-muted-foreground">{achievement.description}</p>
           <p className="text-xs text-primary font-medium">+{achievement.points} XP</p>
           {isUnlocked && unlockedAt && (
             <p className="text-xs text-muted-foreground">
               Unlocked: {new Date(unlockedAt).toLocaleDateString()}
             </p>
           )}
         </div>
       </TooltipContent>
     </Tooltip>
   );
 }