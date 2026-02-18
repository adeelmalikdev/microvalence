import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Globe, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BrowseRecruiters() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: recruiters, isLoading } = useQuery({
    queryKey: ["browse-recruiters"],
    queryFn: async () => {
      const { data: recruiterIds, error: rpcError } = await supabase
        .rpc("get_users_by_role", { _role: "recruiter" });

      console.log("RPC recruiterIds:", recruiterIds, "error:", rpcError);
      if (rpcError) throw rpcError;
      if (!recruiterIds || recruiterIds.length === 0) return [];

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, bio, company_name, company_logo, industry, location, company_website, company_description")
        .in("user_id", recruiterIds as string[]);
      console.log("Recruiter profiles:", profiles, "error:", error);

      if (error) throw error;
      return profiles ?? [];
    },
  });

  const filtered = recruiters?.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.company_name?.toLowerCase().includes(q) ||
      r.industry?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container px-4 py-8 max-w-5xl">
      <BackButton fallbackPath="/student/dashboard" className="mb-6" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Browse Companies</h1>
        <p className="text-muted-foreground">Discover recruiters and companies on the platform</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, industry, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((recruiter) => (
            <Card
              key={recruiter.user_id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/student/recruiter/${recruiter.user_id}`)}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14 rounded-xl">
                    <AvatarImage src={recruiter.company_logo || recruiter.avatar_url || undefined} />
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-lg">
                      {recruiter.company_name?.[0] || recruiter.full_name?.[0] || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {recruiter.company_name || recruiter.full_name || "Company"}
                    </h3>
                    {recruiter.full_name && recruiter.company_name && (
                      <p className="text-sm text-muted-foreground truncate">{recruiter.full_name}</p>
                    )}
                    {recruiter.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{recruiter.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {recruiter.industry && (
                        <Badge variant="secondary" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          {recruiter.industry}
                        </Badge>
                      )}
                      {recruiter.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {recruiter.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground mb-1">No recruiters found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Try adjusting your search terms" : "No recruiters have joined the platform yet"}
          </p>
        </div>
      )}
    </div>
  );
}
