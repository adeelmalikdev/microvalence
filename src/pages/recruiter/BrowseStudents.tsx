import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, MapPin, Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BrowseStudents() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: students, isLoading } = useQuery({
    queryKey: ["browse-students"],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (!roles || roles.length === 0) return [];

      const studentIds = roles.map((r) => r.user_id);

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, bio, university, major, graduation_year, location")
        .in("user_id", studentIds);

      if (error) throw error;
      return profiles ?? [];
    },
  });

  const filtered = students?.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.full_name?.toLowerCase().includes(q) ||
      s.university?.toLowerCase().includes(q) ||
      s.major?.toLowerCase().includes(q) ||
      s.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container px-4 py-8 max-w-5xl">
      <BackButton fallbackPath="/recruiter/dashboard" className="mb-6" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Browse Students</h1>
        <p className="text-muted-foreground">Discover talented students on the platform</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, university, major, or location..."
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
                  <Skeleton className="h-14 w-14 rounded-full" />
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
          {filtered.map((student) => (
            <Card
              key={student.user_id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/recruiter/student/${student.user_id}`)}
            >
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={student.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {student.full_name?.[0] || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {student.full_name || "Student"}
                    </h3>
                    {student.bio && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{student.bio}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {student.university && (
                        <Badge variant="secondary" className="text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {student.university}
                        </Badge>
                      )}
                      {student.major && (
                        <Badge variant="outline" className="text-xs">
                          {student.major}
                        </Badge>
                      )}
                      {student.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {student.location}
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
          <h3 className="font-medium text-foreground mb-1">No students found</h3>
          <p className="text-sm text-muted-foreground">
            {search ? "Try adjusting your search terms" : "No students have joined the platform yet"}
          </p>
        </div>
      )}
    </div>
  );
}
