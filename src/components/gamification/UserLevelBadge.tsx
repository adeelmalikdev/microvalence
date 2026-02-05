 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 import { useGamification, LEVEL_TITLES } from "@/hooks/useGamification";
 import { Star, Zap, Crown, Flame, Sparkles } from "lucide-react";
 import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
 } from "@/components/ui/tooltip";
 
 interface UserLevelBadgeProps {
   size?: "sm" | "md" | "lg";
   showTitle?: boolean;
   className?: string;
 }
 
 const sizeClasses = {
   sm: "w-8 h-8 text-sm",
   md: "w-12 h-12 text-lg",
   lg: "w-16 h-16 text-2xl",
 };
 
 const getLevelIcon = (level: number) => {
   if (level >= 15) return Crown;
   if (level >= 10) return Sparkles;
   if (level >= 5) return Zap;
   return Star;
 };
 
 const getLevelColor = (level: number) => {
   if (level >= 15) return "from-warning to-warning/60 text-warning-foreground";
   if (level >= 10) return "from-secondary to-secondary/60 text-secondary-foreground";
   if (level >= 5) return "from-info to-info/60 text-info-foreground";
   return "from-primary to-primary/60 text-primary-foreground";
 };
 
 export function UserLevelBadge({
   size = "md",
   showTitle = false,
   className,
 }: UserLevelBadgeProps) {
   const { level, levelTitle, xp, xpProgress, streakDays, isLoading } =
     useGamification();
 
   if (isLoading) {
     return (
       <div
         className={cn(
           "rounded-full bg-muted animate-pulse",
           sizeClasses[size],
           className
         )}
       />
     );
   }
 
   const Icon = getLevelIcon(level);
   const colorClass = getLevelColor(level);
 
   const badge = (
     <motion.div
       className={cn(
         "relative rounded-full flex items-center justify-center font-bold bg-gradient-to-br shadow-lg",
         sizeClasses[size],
         colorClass,
         className
       )}
       whileHover={{ scale: 1.1 }}
       whileTap={{ scale: 0.95 }}
     >
       {level}
 
       {/* Level icon */}
       <Icon
         className={cn(
           "absolute -top-1 -right-1",
           size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"
         )}
       />
 
       {/* Streak indicator */}
       {streakDays > 0 && (
         <div
           className={cn(
             "absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-warning text-warning-foreground",
             size === "sm" ? "w-4 h-4 text-[8px]" : "w-5 h-5 text-[10px]"
           )}
         >
           <Flame className={size === "sm" ? "w-2 h-2" : "w-3 h-3"} />
         </div>
       )}
 
       {/* Glow effect */}
       <motion.div
         className="absolute inset-0 rounded-full bg-current opacity-20"
         animate={{
           scale: [1, 1.3, 1],
           opacity: [0.2, 0.1, 0.2],
         }}
         transition={{
           duration: 2,
           repeat: Infinity,
           ease: "easeInOut",
         }}
       />
     </motion.div>
   );
 
   if (showTitle) {
     return (
       <div className="flex items-center gap-2">
         {badge}
         <div>
           <p className="font-medium text-sm">Level {level}</p>
           <p className="text-xs text-muted-foreground">{levelTitle}</p>
         </div>
       </div>
     );
   }
 
   return (
     <Tooltip>
       <TooltipTrigger asChild>{badge}</TooltipTrigger>
       <TooltipContent>
         <div className="space-y-1">
           <p className="font-medium">Level {level}: {levelTitle}</p>
           <p className="text-sm text-muted-foreground">{xp} XP total</p>
           <p className="text-sm text-muted-foreground">
             {Math.round(xpProgress)}% to next level
           </p>
           {streakDays > 0 && (
             <p className="text-sm text-warning flex items-center gap-1">
               <Flame className="w-3 h-3" />
               {streakDays} day streak
             </p>
           )}
         </div>
       </TooltipContent>
     </Tooltip>
   );
 }