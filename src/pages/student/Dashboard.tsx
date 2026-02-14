import { useEffect } from "react";
import { FileText, Clock, CheckCircle, Star, ArrowRight, Building2, Trophy, Eye } from "lucide-react";
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
      {/* Profile Header - Left aligned with level badge on right */}
      <div className="mb-8">
        <div className="flex items-start justify-between glass-light p-6 rounded-2xl">
          {/* Left: Avatar + Name + Headline */}
          <div className="flex items-start gap-4">
            {/* Profile Image */}
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg flex-shrink-0">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || "Profile"} />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              {/* Name */}
              <h1 className="text-2xl font-bold text-foreground">
                {profile?.full_name || firstName}
              </h1>

              {/* Headline / Bio */}
              <p className="text-sm text-muted-foreground mt-1">
                {profile?.bio || "Add your headline in profile settings"}
              </p>

              {/* Portfolio link */}
              <Link to="/student/portfolio" className="mt-3 inline-block">
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View My Portfolio
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Level Badge */}
          <UserLevelBadge size="lg" showTitle />
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
