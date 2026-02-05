 import { useState, useEffect, useCallback } from "react";
 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import confetti from "canvas-confetti";
 import { toast } from "@/hooks/use-toast";
 
 export interface Achievement {
   id: string;
   slug: string;
   title: string;
   description: string;
   icon: string;
   points: number;
   rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
   criteria_type: string;
   criteria_value: number;
 }
 
 export interface UserAchievement {
   id: string;
   user_id: string;
   achievement_id: string;
   unlocked_at: string;
   achievement?: Achievement;
 }
 
 export interface GamificationStats {
   id: string;
   user_id: string;
   xp: number;
   level: number;
   streak_days: number;
   longest_streak: number;
   last_active_at: string;
 }
 
 // XP required for each level (exponential growth)
 export const XP_PER_LEVEL = [
   0,     // Level 1 (starting level)
   100,   // Level 2
   250,   // Level 3
   500,   // Level 4
   850,   // Level 5
   1300,  // Level 6
   1900,  // Level 7
   2650,  // Level 8
   3550,  // Level 9
   4600,  // Level 10
   5800,  // Level 11
   7200,  // Level 12
   8800,  // Level 13
   10600, // Level 14
   12600, // Level 15
   14800, // Level 16
   17200, // Level 17
   19800, // Level 18
   22600, // Level 19
   25600, // Level 20
 ];
 
 export const LEVEL_TITLES = [
   "Newcomer",      // 1
   "Explorer",      // 2
   "Learner",       // 3
   "Achiever",      // 4
   "Rising Star",   // 5
   "Professional",  // 6
   "Expert",        // 7
   "Master",        // 8
   "Champion",      // 9
   "Legend",        // 10
   "Titan",         // 11
   "Mythic",        // 12
   "Immortal",      // 13
   "Divine",        // 14
   "Celestial",     // 15
   "Transcendent",  // 16
   "Ethereal",      // 17
   "Omniscient",    // 18
   "Primordial",    // 19
   "Ascended",      // 20
 ];
 
 export const RARITY_COLORS = {
   common: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
   uncommon: { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
   rare: { bg: "bg-info/10", text: "text-info", border: "border-info/30" },
   epic: { bg: "bg-secondary/10", text: "text-secondary", border: "border-secondary/30" },
   legendary: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
 };
 
 export function calculateLevel(xp: number): number {
   for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
     if (xp >= XP_PER_LEVEL[i]) {
       return i + 1;
     }
   }
   return 1;
 }
 
 export function getXPForNextLevel(level: number): number {
   if (level >= XP_PER_LEVEL.length) return XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
   return XP_PER_LEVEL[level];
 }
 
 export function getXPProgress(xp: number, level: number): number {
   const currentLevelXP = XP_PER_LEVEL[level - 1] || 0;
   const nextLevelXP = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1];
   const xpInCurrentLevel = xp - currentLevelXP;
   const xpNeededForLevel = nextLevelXP - currentLevelXP;
   return Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);
 }
 
 export function useGamification() {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);
 
   // Fetch all achievements
   const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
     queryKey: ["achievements"],
     queryFn: async () => {
       const { data, error } = await supabase
         .from("achievements")
         .select("*")
         .order("points", { ascending: true });
       
       if (error) throw error;
       return data as Achievement[];
     },
   });
 
   // Fetch user's unlocked achievements
   const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery({
     queryKey: ["user-achievements", user?.id],
     queryFn: async () => {
       if (!user?.id) return [];
       
       const { data, error } = await supabase
         .from("user_achievements")
         .select("*, achievement:achievements(*)")
         .eq("user_id", user.id);
       
       if (error) throw error;
       return data as (UserAchievement & { achievement: Achievement })[];
     },
     enabled: !!user?.id,
   });
 
   // Fetch user's gamification stats
   const { data: stats, isLoading: statsLoading } = useQuery({
     queryKey: ["gamification-stats", user?.id],
     queryFn: async () => {
       if (!user?.id) return null;
       
       const { data, error } = await supabase
         .from("user_gamification")
         .select("*")
         .eq("user_id", user.id)
         .single();
       
       if (error && error.code !== "PGRST116") throw error;
       return data as GamificationStats | null;
     },
     enabled: !!user?.id,
   });
 
   // Initialize gamification record for new users
   const initializeGamification = useMutation({
     mutationFn: async () => {
       if (!user?.id) throw new Error("No user");
       
       const { data, error } = await supabase
         .from("user_gamification")
         .insert({ user_id: user.id })
         .select()
         .single();
       
       if (error) throw error;
       return data;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["gamification-stats", user?.id] });
     },
   });
 
   // Add XP mutation
   const addXPMutation = useMutation({
     mutationFn: async ({ amount, reason }: { amount: number; reason?: string }) => {
       if (!user?.id || !stats) throw new Error("No user or stats");
       
       const newXP = stats.xp + amount;
       const oldLevel = stats.level;
       const newLevel = calculateLevel(newXP);
       
       const { error } = await supabase
         .from("user_gamification")
         .update({ xp: newXP, level: newLevel })
         .eq("user_id", user.id);
       
       if (error) throw error;
       
       return { oldLevel, newLevel, newXP, amount };
     },
     onSuccess: ({ oldLevel, newLevel, amount }) => {
       queryClient.invalidateQueries({ queryKey: ["gamification-stats", user?.id] });
       
       // Show XP toast
       toast({
         title: `+${amount} XP`,
         description: "Keep up the great work!",
       });
       
       // Level up celebration
       if (newLevel > oldLevel) {
         confetti({
           particleCount: 150,
           spread: 100,
           origin: { y: 0.6 },
           colors: ["#A855F7", "#06B6D4", "#22C55E"],
         });
         
         toast({
           title: `🎉 Level Up!`,
           description: `You've reached Level ${newLevel}: ${LEVEL_TITLES[newLevel - 1]}!`,
         });
       }
     },
   });
 
   // Unlock achievement mutation
   const unlockAchievement = useMutation({
     mutationFn: async (achievement: Achievement) => {
       if (!user?.id) throw new Error("No user");
       
       // Check if already unlocked
       const alreadyUnlocked = userAchievements.some(
         (ua) => ua.achievement_id === achievement.id
       );
       if (alreadyUnlocked) return null;
       
       const { error } = await supabase
         .from("user_achievements")
         .insert({ user_id: user.id, achievement_id: achievement.id });
       
       if (error) throw error;
       return achievement;
     },
     onSuccess: (achievement) => {
       if (!achievement) return;
       
       queryClient.invalidateQueries({ queryKey: ["user-achievements", user?.id] });
       setNewlyUnlocked((prev) => [...prev, achievement]);
       
       // Celebration effects based on rarity
       const particleCounts = {
         common: 30,
         uncommon: 60,
         rare: 100,
         epic: 150,
         legendary: 250,
       };
       
       confetti({
         particleCount: particleCounts[achievement.rarity],
         spread: 70,
         origin: { y: 0.6 },
       });
       
       toast({
         title: `${achievement.icon} Achievement Unlocked!`,
         description: `${achievement.title} (+${achievement.points} XP)`,
       });
       
       // Also add XP
       if (stats) {
         addXPMutation.mutate({ amount: achievement.points });
       }
     },
   });
 
   // Check and unlock achievements based on user stats
   const checkAchievements = useCallback(
     async (userStats: {
       applications_count?: number;
       accepted_count?: number;
       completed_count?: number;
       tasks_completed?: number;
       messages_sent?: number;
       streak_days?: number;
       profile_complete?: boolean;
       has_avatar?: boolean;
     }) => {
       if (!user?.id || achievements.length === 0) return;
 
       const unlockedIds = new Set(userAchievements.map((ua) => ua.achievement_id));
 
       for (const achievement of achievements) {
         if (unlockedIds.has(achievement.id)) continue;
 
         let shouldUnlock = false;
         const value = userStats[achievement.criteria_type as keyof typeof userStats];
 
         if (typeof value === "number") {
           shouldUnlock = value >= achievement.criteria_value;
         } else if (typeof value === "boolean") {
           shouldUnlock = value;
         }
 
         if (shouldUnlock) {
           await unlockAchievement.mutateAsync(achievement);
         }
       }
     },
     [user?.id, achievements, userAchievements, unlockAchievement]
   );
 
   // Initialize gamification on first load
   useEffect(() => {
     if (user?.id && !statsLoading && !stats) {
       initializeGamification.mutate();
     }
   }, [user?.id, stats, statsLoading]);
 
   // Update streak on login
   useEffect(() => {
     if (!user?.id || !stats) return;
 
     const lastActive = stats.last_active_at ? new Date(stats.last_active_at) : null;
     const now = new Date();
 
     if (!lastActive) {
       // First time - set last_active_at
       supabase
         .from("user_gamification")
         .update({ last_active_at: now.toISOString() })
         .eq("user_id", user.id);
       return;
     }
 
     const daysDiff = Math.floor(
       (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
     );
 
     if (daysDiff === 1) {
       // Consecutive day - increment streak
       const newStreak = stats.streak_days + 1;
       const longestStreak = Math.max(newStreak, stats.longest_streak);
 
       supabase
         .from("user_gamification")
         .update({
           streak_days: newStreak,
           longest_streak: longestStreak,
           last_active_at: now.toISOString(),
         })
         .eq("user_id", user.id);
 
       // Check streak achievements
       checkAchievements({ streak_days: newStreak });
     } else if (daysDiff > 1) {
       // Streak broken - reset to 1
       supabase
         .from("user_gamification")
         .update({
           streak_days: 1,
           last_active_at: now.toISOString(),
         })
         .eq("user_id", user.id);
     }
   }, [user?.id, stats]);
 
   const clearNewlyUnlocked = () => setNewlyUnlocked([]);
 
   return {
     // Data
     achievements,
     userAchievements,
     stats,
     newlyUnlocked,
 
     // Computed
     level: stats?.level ?? 1,
     xp: stats?.xp ?? 0,
     xpProgress: stats ? getXPProgress(stats.xp, stats.level) : 0,
     xpForNextLevel: stats ? getXPForNextLevel(stats.level) : XP_PER_LEVEL[1],
     levelTitle: LEVEL_TITLES[(stats?.level ?? 1) - 1] || "Newcomer",
     streakDays: stats?.streak_days ?? 0,
     unlockedCount: userAchievements.length,
     totalAchievements: achievements.length,
 
     // Loading
     isLoading: achievementsLoading || userAchievementsLoading || statsLoading,
 
     // Actions
     addXP: (amount: number, reason?: string) =>
       addXPMutation.mutate({ amount, reason }),
     checkAchievements,
     clearNewlyUnlocked,
   };
 }