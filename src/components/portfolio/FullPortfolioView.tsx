import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { useStudentProfile } from "@/features/profile/hooks/useStudentProfile";
import { PortfolioProfileCard } from "@/components/portfolio/PortfolioProfileCard";
import { PortfolioAchievements } from "@/components/portfolio/PortfolioAchievements";
import { AboutSection } from "@/features/profile/components/AboutSection";
import { SkillsSection } from "@/features/profile/components/SkillsSection";
import { ProjectsSection } from "@/features/profile/components/ProjectsSection";
import { ExperienceSection } from "@/features/profile/components/ExperienceSection";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Github, Link2, Linkedin, Settings } from "lucide-react";

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

        {/* Social Links Section */}
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
