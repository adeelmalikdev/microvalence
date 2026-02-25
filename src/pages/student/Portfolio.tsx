import { Link } from "react-router-dom";
import { BackButton } from "@/components/BackButton";
import { useStudentPortfolio } from "@/hooks/useStudentPortfolio";
import { useStudentProfile } from "@/features/profile/hooks/useStudentProfile";
import { PortfolioProfileCard } from "@/components/portfolio/PortfolioProfileCard";
import { PortfolioAchievements } from "@/components/portfolio/PortfolioAchievements";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AboutSection } from "@/features/profile/components/AboutSection";
import { SkillsSection } from "@/features/profile/components/SkillsSection";
import { ProjectsSection } from "@/features/profile/components/ProjectsSection";
import { ExperienceSection } from "@/features/profile/components/ExperienceSection";
import { 
  Award, 
  Briefcase, 
  Clock, 
  Download, 
  Star, 
  CheckCircle2,
  Globe,
  Github,
  Link2,
  Linkedin,
  Settings,
} from "lucide-react";
import { format } from "date-fns";

function StatCard({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
}) {
  return (
    <Card className="border-primary/20 bg-card/80 backdrop-blur">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InternshipCard({
  internship,
}: {
  internship: {
    id: string;
    opportunityTitle: string;
    companyName: string;
    completedAt: string;
    durationHours: number;
    skills: string[];
    rating: number | null;
    feedback: string | null;
    certificateId: string | null;
    verificationCode: string | null;
  };
}) {
  const handleDownloadCertificate = () => {
    const certificateContent = `
      <html>
        <head>
          <title>Certificate of Completion</title>
          <style>
            body { font-family: Georgia, serif; text-align: center; padding: 60px; }
            .border { border: 3px double #333; padding: 40px; margin: 20px; }
            h1 { color: #1a365d; font-size: 32px; margin-bottom: 20px; }
            h2 { color: #2d3748; font-size: 24px; margin: 30px 0; }
            p { color: #4a5568; font-size: 16px; line-height: 1.8; }
            .verification { margin-top: 40px; font-size: 12px; color: #718096; }
          </style>
        </head>
        <body>
          <div class="border">
            <h1>🎓 Certificate of Completion</h1>
            <p>This is to certify that</p>
            <h2>has successfully completed</h2>
            <h2>${internship.opportunityTitle}</h2>
            <p>at <strong>${internship.companyName}</strong></p>
            <p>Duration: ${internship.durationHours} hours</p>
            <p>Completed on: ${format(new Date(internship.completedAt), "MMMM d, yyyy")}</p>
            <div class="verification">
              Verification Code: ${internship.verificationCode || "N/A"}
            </div>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([certificateContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate-${internship.companyName.toLowerCase().replace(/\s+/g, "-")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="overflow-hidden border-primary/20">
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
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
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

        {internship.certificateId && (
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleDownloadCertificate}
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function StudentPortfolio() {
  const { data: portfolio, isLoading: portfolioLoading } = useStudentPortfolio();
  const {
    profile,
    skills,
    projects,
    experience,
    isLoading: profileLoading,
    isOwnProfile,
    updateProfile,
    addSkill,
    removeSkill,
    addProject,
    removeProject,
    addExperience,
    removeExperience,
  } = useStudentProfile();

  return (
    <div className="container px-4 py-8">
      <BackButton fallbackPath="/student/dashboard" className="mb-4" />

      <div className="flex justify-center mb-6">
        <Link
          to="/settings"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Settings className="h-4 w-4" />
          Complete your portfolio from Settings &gt; Account
        </Link>
      </div>

      <div className="space-y-6 max-w-5xl">
        {/* Profile Card - always renders, shows skeleton when loading */}
        <PortfolioProfileCard profile={profile} isLoading={profileLoading} />

        {/* Achievement Badges & Level */}
        <PortfolioAchievements />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {portfolioLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <StatCard 
                icon={Briefcase} 
                label="Completed Micro-Internships" 
                value={portfolio?.internships.length || 0} 
              />
              <StatCard 
                icon={Clock} 
                label="Total Hours" 
                value={portfolio?.totalHours || 0} 
              />
              <StatCard 
                icon={Star} 
                label="Average Rating" 
                value={portfolio?.averageRating?.toFixed(1) || "N/A"} 
              />
            </>
          )}
        </div>

        {/* About Section */}
        {profile && (
          <AboutSection
            aboutMe={profile.about_me}
            isOwnProfile={isOwnProfile}
            onSave={(aboutMe) => updateProfile.mutate({ about_me: aboutMe })}
            isSaving={updateProfile.isPending}
          />
        )}

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

        {/* Internships Section */}
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
                <InternshipCard key={internship.id} internship={internship} />
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
                    Complete your first micro-internship to build your portfolio!
                  </p>
                </div>
                <Button asChild>
                  <a href="/student/opportunities">Browse Opportunities</a>
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Social Links Section */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Social Links
            </CardTitle>
            <CardDescription>Add your online profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Github, label: "GitHub", url: profile?.github_url },
                { icon: Globe, label: "Portfolio", url: profile?.portfolio_url },
                { icon: Link2, label: "Website", url: profile?.website },
                { icon: Linkedin, label: "LinkedIn", url: profile?.linkedin_url },
                { icon: Link2, label: "Custom Link", url: profile?.custom_link },
              ].map(({ icon: Icon, label, url }) => (
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
