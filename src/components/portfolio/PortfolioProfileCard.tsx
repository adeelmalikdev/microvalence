import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, GraduationCap, Github, Globe, Link, FileText, Linkedin } from "lucide-react";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { CoverImageUpload } from "@/components/profile/CoverImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import type { ExtendedProfile } from "@/features/profile/hooks/useStudentProfile";

interface PortfolioProfileCardProps {
  profile: ExtendedProfile | null | undefined;
  isLoading: boolean;
}

export function PortfolioProfileCard({ profile, isLoading }: PortfolioProfileCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = user?.id === profile?.user_id;

  const handleAvatarUpload = () => {
    queryClient.invalidateQueries({ queryKey: ["student-profile", user?.id] });
  };

  const handleCoverUpload = () => {
    queryClient.invalidateQueries({ queryKey: ["student-profile", user?.id] });
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20 overflow-hidden">
        <Skeleton className="h-40 sm:h-52 w-full" />
        <CardContent className="p-6">
          <div className="flex items-center gap-6 -mt-14">
            <Skeleton className="h-24 w-24 rounded-full flex-shrink-0 border-4 border-background" />
            <div className="space-y-2 flex-1 mt-14">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) return null;

  const initials = profile.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("") || profile.email?.[0]?.toUpperCase() || "?";

  return (
    <Card className="border-primary/20 overflow-hidden">
      {/* Cover Image */}
      {isOwnProfile ? (
        <CoverImageUpload
          currentUrl={profile.cover_image}
          onUpload={handleCoverUpload}
        />
      ) : (
        <div className="w-full h-40 sm:h-52 bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden">
          {profile.cover_image && (
            <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5 -mt-16 sm:-mt-18">
          {/* Avatar */}
          {isOwnProfile ? (
            <div className="flex-shrink-0 z-10">
              <AvatarUpload
                currentUrl={profile.avatar_url}
                onUpload={handleAvatarUpload}
                size="lg"
              />
            </div>
          ) : (
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-background shadow-lg ring-2 ring-background flex-shrink-0 z-10">
              <AvatarImage
                src={profile.avatar_url || undefined}
                alt={profile.full_name || "Profile"}
                className="object-cover"
                loading="eager"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0 mt-4 sm:mt-10">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {profile.full_name || "Student"}
            </h1>
            {profile.bio && (
              <p className="text-muted-foreground mt-0.5 line-clamp-2">{profile.bio}</p>
            )}
            {profile.status && (
              <Badge variant="secondary" className="mt-2 capitalize">
                {profile.status}
              </Badge>
            )}

            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {profile.university && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-primary" />
                  {profile.university}
                  {profile.major && ` • ${profile.major}`}
                  {profile.graduation_year && ` '${profile.graduation_year.toString().slice(-2)}`}
                </span>
              )}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {profile.location}
                </span>
              )}
              {profile.gpa && (
                <span className="text-primary font-medium">GPA: {Number(profile.gpa).toFixed(2)}</span>
              )}
            </div>

            <div className="flex gap-2 mt-3">
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-4 w-4" />
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Link className="h-4 w-4" />
                </a>
              )}
              {profile.custom_link && (
                <a href={profile.custom_link} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {profile.resume_url && (
                <a href={profile.resume_url} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <FileText className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
