import { useEffect } from "react";
import { FileText, Clock, CheckCircle, Star, ArrowRight, Building2, Trophy, Eye, MapPin, Mail, Github, Globe, Edit } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

import { StatCard } from "@/components/StatCard";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useStudentStats } from "@/hooks/useStudentStats";
import { useRecommendedOpportunities } from "@/hooks/useRecommendedOpportunities";
import { useStudentTasks, useDeadlines } from "@/hooks/useStudentTasks";
import { useGamification } from "@/hooks/useGamification";
import { XPProgressBar } from "@/components/gamification/XPProgressBar";
import { AchievementGrid } from "@/components/gamification/AchievementGrid";
import { UserLevelBadge } from "@/components/gamification/UserLevelBadge";
import { format } from "date-fns";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(" ")[0] || "Student";
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "ST";

  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: opportunities, isLoading: oppsLoading } = useRecommendedOpportunities(3);
  const { data: tasks, isLoading: tasksLoading } = useStudentTasks();
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines();
  const { checkAchievements, stats: gamificationStats } = useGamification();

  useEffect(() => {
    if (stats) {
      checkAchievements({
        applications_count: stats.applicationCount,
        completed_count: stats.completedCount,
        tasks_completed: stats.activeTasksCount || 0,
        profile_complete: !!profile?.full_name && !!profile?.avatar_url,
        has_avatar: !!profile?.avatar_url,
      });
    }
  }, [stats, profile]);

  const statsData = [
    { 
      title: "Applications", 
      value: statsLoading ? "..." : (stats?.applicationCount || 0), 
      icon: FileText, 
      iconColor: "text-info" 
    },
    { 
      title: "Active Tasks", 
      value: statsLoading ? "..." : (stats?.activeTasksCount || 0), 
      icon: Clock, 
      iconColor: "text-warning" 
    },
    { 
      title: "Completed", 
      value: statsLoading ? "..." : (stats?.completedCount || 0), 
      icon: CheckCircle, 
      iconColor: "text-success" 
    },
    { 
      title: "Feedback Score", 
      value: statsLoading ? "..." : (stats?.averageRating?.toFixed(1) || "N/A"), 
      icon: Star, 
      iconColor: "text-warning" 
    },
  ];

  // Calculate performance metrics from stats
  const completionRate = stats && stats.applicationCount > 0 
    ? Math.round((stats.completedCount / stats.applicationCount) * 100) 
    : 0;
  const ratingPercent = stats?.averageRating ? Math.round((stats.averageRating / 5) * 100) : 0;

  const performance = [
    { label: "Completion Rate", value: completionRate },
    { label: "Average Rating", value: ratingPercent, suffix: stats?.averageRating ? `${stats.averageRating.toFixed(1)} ⭐` : "N/A" },
  ];

  return (
    <div className="container py-8">
      {/* LinkedIn-Style Profile Banner */}
      <div className="mb-8 rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-40 sm:h-48 md:h-56">
          {profile?.cover_image ? (
            <img
              src={profile.cover_image}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary via-primary/80 to-accent">
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary-foreground) / 0.15) 1px, transparent 1px), radial-gradient(circle at 80% 20%, hsl(var(--primary-foreground) / 0.1) 1px, transparent 1px)",
                  backgroundSize: "40px 40px, 60px 60px",
                }}
              />
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-3 right-3 gap-1.5 bg-background/80 backdrop-blur-sm hover:bg-background/95"
            onClick={() => navigate("/student/profile")}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>

        {/* Profile Info Section */}
        <div className="relative px-4 sm:px-6 pb-5">
          {/* Avatar overlapping cover */}
          <div className="-mt-14 sm:-mt-16 mb-3">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profile"} />
                <AvatarFallback className="text-2xl sm:text-3xl font-bold bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-success border-2 border-background" />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            {/* Name, Bio, Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {profile?.full_name || "Complete Your Profile"}
                </h1>
                {profile?.full_name && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {profile?.bio || "Add your headline in profile settings"}
              </p>

              <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mt-2">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </span>
                )}
                {profile?.university && (
                  <span className="flex items-center gap-1">
                    🎓 {profile.university}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Link to="/student/portfolio">
                  <Button size="sm" className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" />
                    View My Portfolio
                  </Button>
                </Link>
                <div className="flex items-center gap-1">
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Github className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                  {profile?.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Globe className="h-4 w-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats (desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold text-primary">{statsLoading ? "..." : (stats?.applicationCount || 0)}</div>
                <div className="text-xs text-muted-foreground">Applications</div>
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                <UserLevelBadge size="sm" />
              </div>
              <div className="text-center px-4 py-2 rounded-lg bg-muted/50">
                <div className="text-lg font-bold text-primary">{gamificationStats?.streak_days || 0} 🔥</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 lg:hidden">
            <div className="text-center py-2 rounded-lg bg-muted/50">
              <div className="text-base font-bold text-primary">{statsLoading ? "..." : (stats?.applicationCount || 0)}</div>
              <div className="text-xs text-muted-foreground">Applications</div>
            </div>
            <div className="text-center py-2 rounded-lg bg-muted/50 flex items-center justify-center">
              <UserLevelBadge size="sm" />
            </div>
            <div className="text-center py-2 rounded-lg bg-muted/50">
              <div className="text-base font-bold text-primary">{gamificationStats?.streak_days || 0} 🔥</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <Card className="mb-8 glass-light">
        <CardContent className="p-4">
          <XPProgressBar showDetails />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Opportunities */}
          <Card className="glass-light">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Recommended Micro-Internships</CardTitle>
                <p className="text-sm text-muted-foreground">Based on your skills and interests</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/student/opportunities")}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {oppsLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </>
              ) : opportunities && opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    title={opp.title}
                    company={opp.company_name}
                    skills={opp.skills_required}
                    duration={getDurationLabel(opp.duration_hours)}
                    level={capitalize(opp.level) as "Beginner" | "Intermediate" | "Advanced"}
                    isRemote={opp.is_remote}
                    onViewDetails={() => navigate(`/student/opportunities/${opp.id}`)}
                  />
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No new opportunities available. Check back soon!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Ongoing Tasks */}
          <Card className="glass-light">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold">Ongoing Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Track your active micro-internship tasks</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => navigate("/student/tasks")}
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                <>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </>
              ) : tasks && tasks.length > 0 ? (
                tasks.slice(0, 3).map((task) => (
                  <TaskCardItem
                    key={task.id}
                    title={task.title}
                    company={task.opportunity?.company_name || "Unknown"}
                    status={task.submission?.status || "not_started"}
                    dueDays={task.due_days}
                  />
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No active tasks. Apply to opportunities to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="glass-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                <Clock className="h-4 w-4" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deadlinesLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </>
              ) : deadlines && deadlines.length > 0 ? (
                deadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-start gap-3">
                    <div className={`mt-1.5 w-2 h-2 rounded-full ${
                      deadline.isUrgent ? "bg-destructive" : "bg-success"
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(deadline.dueDate, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 h-10"
                onClick={() => navigate("/student/opportunities")}
              >
                <Building2 className="h-4 w-4" />
                Browse Opportunities
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 h-10"
                onClick={() => navigate("/student/applications")}
              >
                <FileText className="h-4 w-4" />
                My Applications
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 h-10"
                onClick={() => navigate("/student/portfolio")}
              >
                <Star className="h-4 w-4" />
                My Portfolio
              </Button>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="glass-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">📈 Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {statsLoading ? (
                <>
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </>
              ) : (
                performance.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">
                        {item.suffix || `${item.value}%`}
                      </span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Achievements Preview */}
          <Card className="glass-light">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                <Trophy className="h-4 w-4" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AchievementGrid showFilters={false} maxItems={8} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getDurationLabel(hours: number): string {
  if (hours <= 20) return "1 week";
  if (hours <= 40) return "2 weeks";
  if (hours <= 60) return "3 weeks";
  return "1 month+";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inline task card component for dashboard
function TaskCardItem({ title, company, status, dueDays }: {
  title: string;
  company: string;
  status: string;
  dueDays: number | null;
}) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    not_started: { label: "Not Started", color: "bg-muted text-muted-foreground" },
    pending: { label: "Submitted", color: "bg-warning/10 text-warning" },
    approved: { label: "Approved", color: "bg-success/10 text-success" },
    needs_revision: { label: "Needs Revision", color: "bg-destructive/10 text-destructive" },
  };

  const statusInfo = statusLabels[status] || statusLabels.not_started;

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-foreground mb-1">{title}</h4>
            <p className="text-sm text-muted-foreground">{company}</p>
            {dueDays && (
              <p className="text-xs text-muted-foreground mt-1">Due in {dueDays} days</p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
