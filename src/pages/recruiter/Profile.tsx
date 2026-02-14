import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { Building2, Globe, MapPin, Calendar, Users, Save, Loader2, Briefcase } from "lucide-react";

const INDUSTRY_OPTIONS = [
  "Technology", "Finance", "Healthcare", "Education", "Marketing",
  "Consulting", "Manufacturing", "Retail", "Media", "Other",
];

const SIZE_OPTIONS = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+",
];

export default function RecruiterProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["recruiter-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: opportunities } = useQuery({
    queryKey: ["recruiter-opportunities", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("No user");
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title, status, company_name, created_at")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const [form, setForm] = useState<Record<string, string>>({});

  // Populate form when profile loads
  const formValues = {
    full_name: form.full_name ?? profile?.full_name ?? "",
    company_name: form.company_name ?? (profile as any)?.company_name ?? "",
    company_website: form.company_website ?? (profile as any)?.company_website ?? "",
    industry: form.industry ?? (profile as any)?.industry ?? "",
    company_size: form.company_size ?? (profile as any)?.company_size ?? "",
    company_description: form.company_description ?? (profile as any)?.company_description ?? "",
    location: form.location ?? profile?.location ?? "",
    founded_year: form.founded_year ?? ((profile as any)?.founded_year?.toString() ?? ""),
  };

  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const updates: Record<string, any> = {};
      for (const [key, value] of Object.entries(form)) {
        if (key === "founded_year") {
          updates[key] = value ? parseInt(value, 10) : null;
        } else {
          updates[key] = value || null;
        }
      }
      if (Object.keys(updates).length === 0) return;

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiter-profile", user?.id] });
      setForm({});
      toast.success("Profile saved successfully");
    },
    onError: () => toast.error("Failed to save profile"),
  });

  const setField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Company Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your company information visible to students</p>
      </div>

      {/* Avatar / Logo */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Company Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AvatarUpload
            currentUrl={profile?.avatar_url}
            onUpload={() => queryClient.invalidateQueries({ queryKey: ["recruiter-profile", user?.id] })}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Your Name</Label>
              <Input
                id="full_name"
                value={formValues.full_name}
                onChange={(e) => setField("full_name", e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                value={formValues.company_name}
                onChange={(e) => setField("company_name", e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_website" className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" /> Website
              </Label>
              <Input
                id="company_website"
                value={formValues.company_website}
                onChange={(e) => setField("company_website", e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Location
              </Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formValues.industry}
                onValueChange={(v) => setField("industry", v)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Company Size
              </Label>
              <Select
                value={formValues.company_size}
                onValueChange={(v) => setField("company_size", v)}
              >
                <SelectTrigger id="company_size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s} employees</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded_year" className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Founded Year
              </Label>
              <Input
                id="founded_year"
                type="number"
                value={formValues.founded_year}
                onChange={(e) => setField("founded_year", e.target.value)}
                placeholder="2020"
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_description">Company Description</Label>
            <Textarea
              id="company_description"
              value={formValues.company_description}
              onChange={(e) => setField("company_description", e.target.value)}
              placeholder="Tell students about your company..."
              rows={4}
            />
          </div>

          <Button
            onClick={() => updateProfile.mutate()}
            disabled={updateProfile.isPending || Object.keys(form).length === 0}
            className="gap-2"
          >
            {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Posted Opportunities */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Posted Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities && opportunities.length > 0 ? (
            <div className="space-y-3">
              {opportunities.map((opp) => (
                <div key={opp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{opp.title}</p>
                    <p className="text-sm text-muted-foreground">{opp.company_name}</p>
                  </div>
                  <Badge variant={opp.status === "published" ? "default" : "secondary"} className="capitalize">
                    {opp.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No opportunities posted yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
