import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { useStudentProfile } from "@/features/profile/hooks/useStudentProfile";
import { useStudentPortfolio } from "@/hooks/useStudentPortfolio";
import { PortfolioProfileCard } from "@/components/portfolio/PortfolioProfileCard";
import { PortfolioAchievements } from "@/components/portfolio/PortfolioAchievements";
import { AboutSection } from "@/features/profile/components/AboutSection";
import { SkillsSection } from "@/features/profile/components/SkillsSection";
import { ProjectsSection } from "@/features/profile/components/ProjectsSection";
import { ExperienceSection } from "@/features/profile/components/ExperienceSection";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Github, Link2, Linkedin, Settings, Award, Briefcase, Clock, Star, CheckCircle2, Download } from "lucide-react";
import { format } from "date-fns";

interface FullPortfolioViewProps {
  userId?: string;
  backPath?: string;
}

export function FullPortfolioView({ userId, backPath = "/student/dashboard" }: FullPortfolioViewProps) {
  const {
    profile,
    skills,
    projects,
    experience,
    isLoading,
    isOwnProfile,
    updateProfile,
    addSkill,
    removeSkill,
    addProject,
    removeProject,
    addExperience,
    removeExperience,
  } = useStudentProfile(userId);
  const { data: portfolio, isLoading: portfolioLoading } = useStudentPortfolio(userId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <BackButton fallbackPath={backPath} className="mb-4" />

      {isOwnProfile && (
        <div className="flex justify-center mb-6">
          <Link
            to="/settings"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Settings className="h-4 w-4" />
            Complete your portfolio from Settings &gt; Account
          </Link>
        </div>
      )}

      <div className="space-y-6 max-w-5xl">
        {/* Profile Card */}
        <PortfolioProfileCard profile={profile} isLoading={false} />

        {/* Achievement Badges & Level */}
        <PortfolioAchievements />

        {/* About Section */}
        <AboutSection
          aboutMe={profile.about_me}
          isOwnProfile={isOwnProfile}
          onSave={(aboutMe) => updateProfile.mutate({ about_me: aboutMe })}
          isSaving={updateProfile.isPending}
        />

        {/* Skills Section */}
        <SkillsSection
          skills={skills}
          isOwnProfile={isOwnProfile}
          onAdd={(skill) => addSkill.mutate(skill)}
          onRemove={(skillId) => removeSkill.mutate(skillId)}
        />

        {/* Projects Section */}
        <ProjectsSection
          projects={projects}
          isOwnProfile={isOwnProfile}
          onAdd={(project) => addProject.mutate(project)}
          onRemove={(projectId) => removeProject.mutate(projectId)}
        />

        {/* Experience Section */}
        <ExperienceSection
          experience={experience}
          isOwnProfile={isOwnProfile}
          onAdd={(exp) => addExperience.mutate(exp)}
          onRemove={(expId) => removeExperience.mutate(expId)}
        />

        {/* Micro-Internship Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {portfolioLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{portfolio?.internships.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Completed Micro-Internships</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{portfolio?.totalHours || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-primary/20 bg-card/80 backdrop-blur">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{portfolio?.averageRating?.toFixed(1) || "N/A"}</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Completed Micro-Internships */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Completed Micro-Internships
          </h2>

          {portfolioLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          ) : portfolio?.internships && portfolio.internships.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {portfolio.internships.map((internship) => (
                <Card key={internship.id} className="overflow-hidden border-primary/20">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{internship.opportunityTitle}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Briefcase className="h-4 w-4" />
                          {internship.companyName}
                        </CardDescription>
                      </div>
                      {internship.rating && (
                        <div className="flex items-center gap-1 rounded-full bg-warning/10 px-3 py-1">
                          <Star className="h-4 w-4 fill-warning text-warning" />
                          <span className="font-semibold text-warning">{internship.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {internship.durationHours} hours
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Completed {format(new Date(internship.completedAt), "MMM yyyy")}
                      </div>
                    </div>

                    {internship.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Skills Demonstrated</p>
                        <div className="flex flex-wrap gap-2">
                          {internship.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {internship.feedback && (
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-medium mb-1">Recruiter Feedback</p>
                        <p className="text-sm text-muted-foreground italic">"{internship.feedback}"</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-primary/20">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">No Completed Micro-Internships Yet</h3>
                  <p className="text-muted-foreground mt-1">
                    {isOwnProfile
                      ? "Complete your first micro-internship to build your portfolio!"
                      : "This student hasn't completed any micro-internships yet."}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>


        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Social Links
            </CardTitle>
            <CardDescription>Online profiles &amp; links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Github, label: "GitHub", url: profile?.github_url },
                { icon: Globe, label: "Portfolio", url: profile?.portfolio_url },
                { icon: Link2, label: "Website", url: profile?.website },
                { icon: Linkedin, label: "LinkedIn", url: profile?.linkedin_url },
                { icon: Link2, label: "Custom Link", url: profile?.custom_link },
              ]
                .filter((item) => isOwnProfile || item.url)
                .map(({ icon: Icon, label, url }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{label}</p>
                      {url ? (
                        <a
                          href={url.startsWith("http") ? url : `https://${url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate block"
                        >
                          {url}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Not added yet</p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
