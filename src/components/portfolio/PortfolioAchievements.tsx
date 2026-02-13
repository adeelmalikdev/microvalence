import { useGamification, RARITY_COLORS, LEVEL_TITLES, getXPProgress, getXPForNextLevel } from "@/hooks/useGamification";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Star } from "lucide-react";

export function PortfolioAchievements() {
  const {
    userAchievements,
    stats,
    level,
    xp,
    xpProgress,
    xpForNextLevel,
    levelTitle,
    streakDays,
    unlockedCount,
    totalAchievements,
    isLoading,
  } = useGamification();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Level & XP Bar */}
      <Card className="border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Level {level}</p>
                <p className="text-xs text-muted-foreground">{levelTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-destructive" />
                {streakDays}d streak
              </span>
              <span>{xp} XP</span>
            </div>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(xpForNextLevel - xp)} XP to next level
          </p>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      {userAchievements.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3 pt-4 px-5">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Achievements ({unlockedCount}/{totalAchievements})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="flex flex-wrap gap-2">
              {userAchievements.slice(0, 8).map((ua) => {
                const achievement = ua.achievement;
                if (!achievement) return null;
                const colors = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
                return (
                  <Badge
                    key={ua.id}
                    variant="outline"
                    className={`${colors.bg} ${colors.text} ${colors.border} gap-1 py-1`}
                    title={`${achievement.title}: ${achievement.description}`}
                  >
                    <span>{achievement.icon}</span>
                    <span className="text-xs">{achievement.title}</span>
                  </Badge>
                );
              })}
              {userAchievements.length > 8 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +{userAchievements.length - 8} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
