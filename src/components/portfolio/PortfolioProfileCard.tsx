import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, GraduationCap, Github, Globe, Link, FileText } from "lucide-react";
import type { ExtendedProfile } from "@/features/profile/hooks/useStudentProfile";

interface PortfolioProfileCardProps {
  profile: ExtendedProfile | null | undefined;
  isLoading: boolean;
}

export function PortfolioProfileCard({ profile, isLoading }: PortfolioProfileCardProps) {
  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
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
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          {/* Avatar */}
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-primary/20 shadow-lg ring-2 ring-background flex-shrink-0">
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

          {/* Info */}
          <div className="flex-1 min-w-0">
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

            {/* Academic Info */}
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

            {/* Social Links */}
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
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                  <Link className="h-4 w-4" />
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
