import { useEffect } from "react";
import { FileText, Clock, CheckCircle, Star, ArrowRight, Building2, Trophy, Eye, Github, Globe, Linkedin, Link as LinkIcon, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

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
  const displayName = profile?.full_name || "Student";
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "ST";

  const linkedinUrl = profile?.linkedin_url;
  const customLink = profile?.custom_link;

  const { data: stats, isLoading: statsLoading } = useStudentStats();
  const { data: opportunities, isLoading: oppsLoading } = useRecommendedOpportunities(3);
  const { data: tasks, isLoading: tasksLoading } = useStudentTasks();
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines();
  const { checkAchievements } = useGamification();

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
    { title: "Applications", value: statsLoading ? "..." : (stats?.applicationCount || 0), icon: FileText, iconColor: "text-info" },
    { title: "Active Tasks", value: statsLoading ? "..." : (stats?.activeTasksCount || 0), icon: Clock, iconColor: "text-warning" },
    { title: "Completed", value: statsLoading ? "..." : (stats?.completedCount || 0), icon: CheckCircle, iconColor: "text-success" },
    { title: "Feedback Score", value: statsLoading ? "..." : (stats?.averageRating?.toFixed(1) || "N/A"), icon: Star, iconColor: "text-warning" },
  ];

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
      {/* Premium Profile Header */}
      <ProfileHeader
        displayName={displayName}
        initials={initials}
        profile={profile}
        linkedinUrl={linkedinUrl}
        customLink={customLink}
        navigate={navigate}
      />

      {/* XP + Stats in one row */}
      <div className="grid lg:grid-cols-5 gap-4 mb-8">
        <Card className="lg:col-span-3 border-border/60 shadow-[var(--shadow-soft)] card-lift">
          <CardContent className="p-4">
            <XPProgressBar showDetails />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 border-border/60 shadow-[var(--shadow-soft)] card-lift">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {statsData.map((stat) => (
                <div key={stat.title} className="flex items-center gap-2.5 group">
                  <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform duration-200 ${stat.iconColor}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recommended Opportunities */}
          <Card className="border-border/60 shadow-[var(--shadow-soft)] overflow-hidden accent-bar-top">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Recommended Micro-Internships</CardTitle>
                <p className="text-sm text-muted-foreground">Based on your skills and interests</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground group/link rounded-full"
                onClick={() => navigate("/student/opportunities")}
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {oppsLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="h-24 w-full rounded-xl animate-shimmer" />
                ))
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
                <EmptyState
                  icon={Briefcase}
                  title="No opportunities yet"
                  description="Start exploring opportunities and build your portfolio"
                  actionLabel="Browse Opportunities"
                  onAction={() => navigate("/student/opportunities")}
                />
              )}
            </CardContent>
          </Card>

          {/* Ongoing Tasks */}
          <Card className="border-border/60 shadow-[var(--shadow-soft)] overflow-hidden accent-bar-top">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Ongoing Tasks</CardTitle>
                <p className="text-sm text-muted-foreground">Track your active micro-internship tasks</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-muted-foreground hover:text-foreground group/link rounded-full"
                onClick={() => navigate("/student/tasks")}
              >
                View All
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasksLoading ? (
                [1, 2].map((i) => (
                  <div key={i} className="h-20 w-full rounded-xl animate-shimmer" />
                ))
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
                <EmptyState
                  icon={Clock}
                  title="No active tasks"
                  description="Apply to opportunities to get started!"
                  actionLabel="Find Opportunities"
                  onAction={() => navigate("/student/opportunities")}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SidebarDeadlines deadlinesLoading={deadlinesLoading} deadlines={deadlines} />
          <SidebarQuickActions navigate={navigate} />
          <SidebarPerformance statsLoading={statsLoading} performance={performance} />
          <SidebarAchievements />
        </div>
      </div>
    </div>
  );
}

/* ═══════════ Sub-components ═══════════ */

import type { LucideIcon } from "lucide-react";

function ProfileHeader({ displayName, initials, profile, linkedinUrl, customLink, navigate }: any) {
  return (
    <Card className="mb-8 overflow-hidden border-border/60 shadow-[var(--shadow-medium)] relative">
      {/* Background gradient with pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar with layered shadow */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent blur-md opacity-30 scale-110" />
            <Avatar className="h-28 w-28 border-4 border-background shadow-[var(--shadow-medium)] relative">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-success border-3 border-background shadow-sm" />
          </div>

          {/* Name + Bio + Links */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {profile?.bio || "Add your headline in Settings → Account"}
            </p>

            {/* Meta info */}
            {(profile?.location || profile?.university) && (
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                {profile?.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{profile.location}</span>
                )}
                {profile?.university && (
                  <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{profile.university}</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Link to="/student/portfolio">
                <Button size="sm" className="gap-2 h-8 rounded-full shadow-[var(--shadow-emerald-glow)] hover:shadow-[var(--glow-hover)] transition-all duration-300">
                  <Eye className="h-3.5 w-3.5" />
                  View Portfolio
                </Button>
              </Link>
              {/* Social Links */}
              <SocialLinks profile={profile} linkedinUrl={linkedinUrl} customLink={customLink} />
            </div>
          </div>

          {/* Right: Level Badge */}
          <div className="shrink-0 self-start sm:self-center">
            <UserLevelBadge size="lg" showTitle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialLinks({ profile, linkedinUrl, customLink }: any) {
  const links = [
    { url: linkedinUrl, icon: Linkedin },
    { url: profile?.github_url, icon: Github },
    { url: profile?.portfolio_url, icon: Globe },
    { url: profile?.website, icon: Globe },
    { url: customLink, icon: LinkIcon },
  ].filter(l => l.url);

  if (links.length === 0) return null;

  return (
    <>
      {links.map((link, i) => (
        <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
          className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110">
          <link.icon className="h-4 w-4" />
        </a>
      ))}
    </>
  );
}

function SidebarDeadlines({ deadlinesLoading, deadlines }: any) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)] card-lift">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-primary">
          <Clock className="h-4 w-4" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {deadlinesLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-10 w-full rounded-lg animate-shimmer" />)
        ) : deadlines && deadlines.length > 0 ? (
          deadlines.map((deadline: any) => (
            <div key={deadline.id} className="flex items-start gap-3 group">
              <div className={`mt-1.5 w-2 h-2 rounded-full transition-transform duration-200 group-hover:scale-150 ${deadline.isUrgent ? "bg-destructive" : "bg-success"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                <p className="text-xs text-muted-foreground">{format(deadline.dueDate, "MMM d, yyyy")}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
        )}
      </CardContent>
    </Card>
  );
}

function SidebarQuickActions({ navigate }: { navigate: (path: string) => void }) {
  const actions = [
    { label: "Browse Opportunities", icon: Building2, path: "/student/opportunities" },
    { label: "My Applications", icon: FileText, path: "/student/applications" },
    { label: "My Portfolio", icon: Star, path: "/student/portfolio" },
  ];

  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)] card-lift">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {actions.map((action) => (
          <Button
            key={action.path}
            variant="ghost"
            className="w-full justify-start gap-2.5 h-10 rounded-xl hover:translate-x-1 transition-all duration-200"
            onClick={() => navigate(action.path)}
          >
            <action.icon className="h-4 w-4" /> {action.label}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}

function SidebarPerformance({ statsLoading, performance }: any) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)] card-lift">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          📈 Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsLoading ? (
          [1, 2].map((i) => <div key={i} className="h-8 w-full rounded-lg animate-shimmer" />)
        ) : (
          performance.map((item: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.suffix || `${item.value}%`}</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function SidebarAchievements() {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)] card-lift">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-primary">
          <Trophy className="h-4 w-4" /> Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AchievementGrid showFilters={false} maxItems={8} />
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="text-center py-10 space-y-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Button onClick={onAction} className="rounded-full shadow-[var(--shadow-emerald-glow)] hover:shadow-[var(--glow-hover)] transition-all duration-300">
        {actionLabel}
      </Button>
    </div>
  );
}

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
    <Card className="border-border/60 shadow-[var(--shadow-soft)] card-lift group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors duration-200">{title}</h4>
            <p className="text-sm text-muted-foreground">{company}</p>
            {dueDays && <p className="text-xs text-muted-foreground mt-1">Due in {dueDays} days</p>}
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════ Helpers ═══════════ */

function getDurationLabel(hours: number): string {
  if (hours <= 20) return "1 week";
  if (hours <= 40) return "2 weeks";
  if (hours <= 60) return "3 weeks";
  return "1 month+";
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
