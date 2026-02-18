import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Globe, Calendar, Users, Briefcase } from "lucide-react";

function ensureAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default function RecruiterProfile() {
  const { userId } = useParams<{ userId: string }>();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["recruiter-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: opportunities } = useQuery({
    queryKey: ["recruiter-opportunities", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title, level, status, is_remote, location")
        .eq("recruiter_id", userId!)
        .eq("status", "published")
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });

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
    <div className="container px-4 py-8 max-w-4xl">
      <BackButton fallbackPath="/student/browse-recruiters" className="mb-6" />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-20 w-20 rounded-xl">
              <AvatarImage src={profile.company_logo || profile.avatar_url || undefined} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-2xl">
                {profile.company_name?.[0] || profile.full_name?.[0] || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {profile.company_name || profile.full_name || "Company"}
              </h1>
              {profile.full_name && profile.company_name && (
                <p className="text-muted-foreground">{profile.full_name}</p>
              )}
              {profile.bio && (
                <p className="text-muted-foreground mt-2">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {profile.industry && (
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
                    {profile.industry}
                  </Badge>
                )}
                {profile.company_size && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {profile.company_size}
                  </Badge>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.location}
                  </span>
                )}
                {profile.founded_year && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Founded {profile.founded_year}
                  </span>
                )}
              </div>

              {profile.company_website && (
                <a
                  href={ensureAbsoluteUrl(profile.company_website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {profile.company_website}
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {profile.company_description && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{profile.company_description}</p>
          </CardContent>
        </Card>
      )}

      {opportunities && opportunities.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Open Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/student/opportunities/${opp.id}`}
                >
                  <div>
                    <p className="font-medium text-foreground">{opp.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{opp.level}</Badge>
                      {opp.is_remote && <Badge variant="secondary" className="text-xs">Remote</Badge>}
                      {opp.location && (
                        <span className="text-xs text-muted-foreground">{opp.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
