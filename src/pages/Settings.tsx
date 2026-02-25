import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  User,
  Download,
  Trash2,
  ArrowLeft,
  Palette,
  Globe,
  Save,
  Github,
  Camera,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Link as LinkIcon,
  Linkedin,
  Loader2,
  CheckCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { AvatarUpload } from "@/components/profile/AvatarUpload";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { DataExportButton } from "@/components/settings/DataExportButton";
import { AccountDeletionDialog } from "@/components/settings/AccountDeletionDialog";
import { toast } from "sonner";

export default function Settings() {
  const navigate = useNavigate();
  const { profile, role, user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable profile fields
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [customLink, setCustomLink] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [semester, setSemester] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [status, setStatus] = useState("");
  // Recruiter company fields
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [foundedYear, setFoundedYear] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setEmail(profile.email || user?.email || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setGithubUrl(profile.github_url || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPortfolioUrl(profile.portfolio_url || "");
      setWebsite(profile.website || "");
      setCustomLink(profile.custom_link || "");
      setUniversity(profile.university || "");
      setMajor(profile.major || "");
      setSemester(profile.semester?.toString() || "");
      setGraduationYear(profile.graduation_year?.toString() || "");
      setStatus(profile.status || "");
      // Recruiter fields
      setCompanyName(profile.company_name || "");
      setCompanyWebsite(profile.company_website || "");
      setIndustry(profile.industry || "");
      setCompanySize(profile.company_size || "");
      setCompanyDescription(profile.company_description || "");
      setFoundedYear(profile.founded_year?.toString() || "");
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      // Update email in auth if changed
      const currentEmail = profile?.email || user?.email;
      if (email.trim() && email.trim() !== currentEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email.trim(),
        });
        if (emailError) {
          toast.error("Failed to update email: " + emailError.message);
        } else {
          toast.info("Check your new email for a confirmation link.");
        }
      }

      // Update profile fields
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user?.id,
          email: email.trim() || user?.email || "",
          full_name: fullName.trim(),
          bio: bio.trim() || null,
          phone: phone.trim() || null,
          location: location.trim() || null,
          github_url: githubUrl.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
          website: website.trim() || null,
          custom_link: customLink.trim() || null,
          university: university.trim() || null,
          major: major.trim() || null,
          semester: semester ? parseInt(semester) : null,
          graduation_year: graduationYear ? parseInt(graduationYear) : null,
          status: status || null,
          // Recruiter company fields
          company_name: companyName.trim() || null,
          company_website: companyWebsite.trim() || null,
          industry: industry || null,
          company_size: companySize || null,
          company_description: companyDescription.trim() || null,
          founded_year: foundedYear ? parseInt(foundedYear) : null,
        }, { onConflict: 'user_id' });

      if (error) throw error;

      await refreshProfile();
      // Invalidate Portfolio's separate profile query so it re-fetches
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      setSaveSuccess(true);
      toast.success("Profile saved successfully!");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    await refreshProfile();
    queryClient.invalidateQueries({ queryKey: ["student-profile"] });
  };

  const dashboardPath = role ? `/${role}/dashboard` : "/student/dashboard";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(dashboardPath)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══ ACCOUNT TAB ═══ */}
          <TabsContent value="profile" className="space-y-6">

            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Photo
                </CardTitle>
                <CardDescription>
                  This photo appears on your dashboard and portfolio. Upload, crop and adjust before saving.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload
                  currentUrl={profile?.avatar_url}
                  onUpload={handleAvatarUpload}
                />
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your name and headline appear on your dashboard header and portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Changing email requires re-verification
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input value={role || ""} disabled className="capitalize" />
                    <p className="text-xs text-muted-foreground">Role cannot be changed</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Headline / Bio
                    <span className="text-xs text-muted-foreground ml-2">
                      (appears under your name on dashboard)
                    </span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Aspiring AI Engineer | Machine Learning & Deep Learning"
                    rows={2}
                    maxLength={150}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {bio.length}/150 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Education (students) or Company Details (recruiters) */}
            {role === "recruiter" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Details
                  </CardTitle>
                  <CardDescription>
                    Your company information visible to students
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite" className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" /> Website
                      </Label>
                      <Input
                        id="companyWebsite"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select value={industry} onValueChange={setIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Technology", "Finance", "Healthcare", "Education", "Marketing", "Consulting", "Manufacturing", "Retail", "Media", "Other"].map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Size</Label>
                      <Select value={companySize} onValueChange={setCompanySize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"].map((s) => (
                            <SelectItem key={s} value={s}>{s} employees</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Founded Year</Label>
                      <Input
                        type="number"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        placeholder="2020"
                        min={1900}
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyDescription">Company Description</Label>
                    <Textarea
                      id="companyDescription"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Tell students about your company..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                  <CardDescription>
                    Your academic information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="International Islamic University"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major / Degree</Label>
                      <Input
                        id="major"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="Artificial Intelligence"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freshman">Freshman (1st Year)</SelectItem>
                          <SelectItem value="sophomore">Sophomore (2nd Year)</SelectItem>
                          <SelectItem value="junior">Junior (3rd Year)</SelectItem>
                          <SelectItem value="senior">Senior (4th Year)</SelectItem>
                          <SelectItem value="graduated">✓ Graduated (Alumni)</SelectItem>
                        </SelectContent>
                      </Select>
                      {status === "graduated" && (
                        <div className="mt-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-semibold text-foreground mb-0.5">
                                Alumni Status Activated 🎓
                              </p>
                              <p className="text-muted-foreground">
                                You'll be marked as an Alumni and gain access to the Alumni
                                Network, mentorship features, and exclusive alumni opportunities.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Current Semester</Label>
                      <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <SelectItem key={s} value={s.toString()}>
                              Semester {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Graduation Year</Label>
                      <Select value={graduationYear} onValueChange={setGraduationYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social & Professional Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Social & Professional Links
                </CardTitle>
                <CardDescription>
                  These links appear on your dashboard and portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="flex items-center gap-1.5">
                      <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                    </Label>
                    <Input
                      id="linkedin"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github" className="flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5" /> GitHub
                    </Label>
                    <Input
                      id="github"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolio" className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Portfolio
                    </Label>
                    <Input
                      id="portfolio"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5" /> Website
                    </Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customLink" className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" /> Custom / Freelance Platform Link
                  </Label>
                  <Input
                    id="customLink"
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    placeholder="https://upwork.com/freelancers/~ or any other link"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add Upwork, Fiverr, Contra, or any other platform
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                All changes are saved to your profile and reflected everywhere instantly.
              </p>
              <Button onClick={handleSaveProfile} disabled={saving} className="min-w-[140px]">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySettings />
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme
                </CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Theme settings are managed via the system theme button in the navigation bar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Language
                </CardTitle>
                <CardDescription>
                  Choose your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Currently only English is supported. More languages coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Your Data
                </CardTitle>
                <CardDescription>
                  Download a copy of all your data (GDPR compliant)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export includes your profile information, applications, messages,
                  submissions, feedback, and certificates.
                </p>
                <DataExportButton />
              </CardContent>
            </Card>

            <Separator />

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain.
                  You will have a 14-day grace period to cancel the deletion.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AccountDeletionDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </div>
  );
}
