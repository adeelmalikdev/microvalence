 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 import { useGamification, LEVEL_TITLES } from "@/hooks/useGamification";
 import { Sparkles, Flame, TrendingUp } from "lucide-react";
 import {
   Tooltip,
   TooltipContent,
   TooltipTrigger,
 } from "@/components/ui/tooltip";
 
 interface XPProgressBarProps {
   showDetails?: boolean;
   compact?: boolean;
   className?: string;
 }
 
 export function XPProgressBar({
   showDetails = true,
   compact = false,
   className,
 }: XPProgressBarProps) {
   const {
     level,
     xp,
     xpProgress,
     xpForNextLevel,
     levelTitle,
     streakDays,
     isLoading,
   } = useGamification();
 
   if (isLoading) {
     return (
       <div className={cn("animate-pulse", className)}>
         <div className="h-4 bg-muted rounded w-24 mb-2" />
         <div className="h-2 bg-muted rounded w-full" />
       </div>
     );
   }
 
   if (compact) {
     return (
       <Tooltip>
         <TooltipTrigger asChild>
           <div className={cn("flex items-center gap-2 cursor-pointer", className)}>
             <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
               {level}
             </div>
             <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
               <motion.div
                 className="h-full bg-primary rounded-full"
                 initial={{ width: 0 }}
                 animate={{ width: `${xpProgress}%` }}
                 transition={{ duration: 0.5, ease: "easeOut" }}
               />
             </div>
           </div>
         </TooltipTrigger>
         <TooltipContent>
           <p className="font-medium">Level {level}: {levelTitle}</p>
           <p className="text-sm text-muted-foreground">{xp} / {xpForNextLevel} XP</p>
         </TooltipContent>
       </Tooltip>
     );
   }
 
   return (
     <div className={cn("space-y-2", className)}>
       {showDetails && (
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold">
               {level}
             </div>
             <div>
               <p className="font-medium text-sm">Level {level}</p>
               <p className="text-xs text-muted-foreground">{levelTitle}</p>
             </div>
           </div>
 
           <div className="flex items-center gap-3">
             {streakDays > 0 && (
               <div className="flex items-center gap-1 text-warning">
                 <Flame className="w-4 h-4" />
                 <span className="text-sm font-medium">{streakDays}</span>
               </div>
             )}
             <div className="flex items-center gap-1 text-primary">
               <Sparkles className="w-4 h-4" />
               <span className="text-sm font-medium">{xp} XP</span>
             </div>
           </div>
         </div>
       )}
 
       {/* Progress bar */}
       <div className="relative">
         <div className="h-3 bg-muted rounded-full overflow-hidden">
           <motion.div
             className="h-full bg-gradient-to-r from-primary to-secondary rounded-full relative"
             initial={{ width: 0 }}
             animate={{ width: `${xpProgress}%` }}
             transition={{ duration: 0.8, ease: "easeOut" }}
           >
             {/* Shimmer effect */}
             <motion.div
               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
               animate={{ x: ["-100%", "100%"] }}
               transition={{
                 duration: 2,
                 repeat: Infinity,
                 repeatDelay: 3,
                 ease: "easeInOut",
               }}
             />
           </motion.div>
         </div>
 
         {/* Progress text */}
         <div className="flex justify-between mt-1">
           <span className="text-xs text-muted-foreground">
             {Math.round(xpProgress)}%
           </span>
           <span className="text-xs text-muted-foreground">
             {xpForNextLevel - xp} XP to Level {level + 1}
           </span>
         </div>
       </div>
     </div>
   );
 }