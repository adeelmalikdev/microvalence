 import { motion } from "framer-motion";
 import { cn } from "@/lib/utils";
 import { useGamification, RARITY_COLORS } from "@/hooks/useGamification";
 import { AchievementBadge } from "./AchievementBadge";
 import { Trophy, Filter } from "lucide-react";
 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 
 interface AchievementGridProps {
   showFilters?: boolean;
   maxItems?: number;
   className?: string;
 }
 
 type RarityFilter = "all" | "common" | "uncommon" | "rare" | "epic" | "legendary";
 type StatusFilter = "all" | "unlocked" | "locked";
 
 export function AchievementGrid({
   showFilters = true,
   maxItems,
   className,
 }: AchievementGridProps) {
   const { achievements, userAchievements, unlockedCount, totalAchievements, isLoading } =
     useGamification();
   const [rarityFilter, setRarityFilter] = useState<RarityFilter>("all");
   const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
 
   const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
   const unlockedMap = new Map(
     userAchievements.map((ua) => [ua.achievement_id, ua.unlocked_at])
   );
 
   let filteredAchievements = achievements;
 
   if (rarityFilter !== "all") {
     filteredAchievements = filteredAchievements.filter(
       (a) => a.rarity === rarityFilter
     );
   }
 
   if (statusFilter !== "all") {
     filteredAchievements = filteredAchievements.filter((a) =>
       statusFilter === "unlocked" ? unlockedIds.has(a.id) : !unlockedIds.has(a.id)
     );
   }
 
   // Sort: unlocked first, then by rarity (legendary to common)
   const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
   filteredAchievements = [...filteredAchievements].sort((a, b) => {
     const aUnlocked = unlockedIds.has(a.id) ? 0 : 1;
     const bUnlocked = unlockedIds.has(b.id) ? 0 : 1;
     if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
     return rarityOrder[a.rarity] - rarityOrder[b.rarity];
   });
 
   if (maxItems) {
     filteredAchievements = filteredAchievements.slice(0, maxItems);
   }
 
   if (isLoading) {
     return (
       <div className={cn("space-y-4", className)}>
         <div className="flex justify-between items-center">
           <div className="h-6 w-32 bg-muted rounded animate-pulse" />
           <div className="h-8 w-24 bg-muted rounded animate-pulse" />
         </div>
         <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
           {Array.from({ length: 12 }).map((_, i) => (
             <div
               key={i}
               className="w-12 h-12 rounded-full bg-muted animate-pulse"
             />
           ))}
         </div>
       </div>
     );
   }
 
   return (
     <div className={cn("space-y-4", className)}>
       {/* Header */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Trophy className="w-5 h-5 text-primary" />
           <h3 className="font-semibold">Achievements</h3>
           <span className="text-sm text-muted-foreground">
             {unlockedCount} / {totalAchievements}
           </span>
         </div>
 
         {showFilters && (
           <div className="flex items-center gap-2">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="sm">
                   <Filter className="w-4 h-4 mr-1" />
                   {rarityFilter === "all" ? "Rarity" : rarityFilter}
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuItem onClick={() => setRarityFilter("all")}>
                   All Rarities
                 </DropdownMenuItem>
                 {(["legendary", "epic", "rare", "uncommon", "common"] as const).map(
                   (rarity) => (
                     <DropdownMenuItem
                       key={rarity}
                       onClick={() => setRarityFilter(rarity)}
                     >
                       <span
                         className={cn(
                           "w-2 h-2 rounded-full mr-2",
                           RARITY_COLORS[rarity].bg
                         )}
                       />
                       <span className="capitalize">{rarity}</span>
                     </DropdownMenuItem>
                   )
                 )}
               </DropdownMenuContent>
             </DropdownMenu>
 
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="sm">
                   {statusFilter === "all"
                     ? "Status"
                     : statusFilter === "unlocked"
                     ? "Unlocked"
                     : "Locked"}
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent>
                 <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                   All
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setStatusFilter("unlocked")}>
                   Unlocked
                 </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setStatusFilter("locked")}>
                   Locked
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           </div>
         )}
       </div>
 
       {/* Grid */}
       <motion.div
         className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3"
         initial="hidden"
         animate="visible"
         variants={{
           visible: {
             transition: { staggerChildren: 0.05 },
           },
         }}
       >
         {filteredAchievements.map((achievement) => (
           <motion.div
             key={achievement.id}
             variants={{
               hidden: { opacity: 0, scale: 0.8 },
               visible: { opacity: 1, scale: 1 },
             }}
           >
             <AchievementBadge
               achievement={achievement}
               isUnlocked={unlockedIds.has(achievement.id)}
               unlockedAt={unlockedMap.get(achievement.id)}
               size="sm"
             />
           </motion.div>
         ))}
       </motion.div>
 
       {filteredAchievements.length === 0 && (
         <p className="text-center text-muted-foreground py-8">
           No achievements found with current filters.
         </p>
       )}
     </div>
   );
 }