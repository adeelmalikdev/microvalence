import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Trash2, Save, Send, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useRecruiterOpportunityWithApplicants, useUpdateOpportunity } from "@/hooks/useRecruiterData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const opportunitySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  company_name: z.string().min(2, "Company name is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  skills_required: z.array(z.string()).min(1, "Add at least one skill"),
  duration_hours: z.number().min(10).max(160),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  is_remote: z.boolean(),
  location: z.string().optional(),
  max_applicants: z.number().min(1).max(100).optional(),
  deadline: z.string().optional(),
});

type EditFormData = z.infer<typeof opportunitySchema>;

const SKILL_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Python", "Node.js", "SQL",
  "Tailwind CSS", "Figma", "UI/UX", "Git", "REST APIs", "GraphQL",
  "Machine Learning", "Data Analysis", "AWS", "Docker", "MongoDB",
];

export default function EditOpportunity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const updateOpportunity = useUpdateOpportunity();
  const [skillInput, setSkillInput] = useState("");

  const { data, isLoading, error } = useRecruiterOpportunityWithApplicants(id || "");

  const form = useForm<EditFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      company_name: "",
      description: "",
      skills_required: [],
      duration_hours: 40,
      level: "beginner",
      is_remote: true,
      location: "",
      max_applicants: 10,
      deadline: "",
    },
  });

  // Populate form when data loads
  useEffect(() => {
    if (data?.opportunity) {
      const opp = data.opportunity;
      form.reset({
        title: opp.title,
        company_name: opp.company_name,
        description: opp.description,
        skills_required: opp.skills_required,
        duration_hours: opp.duration_hours,
        level: opp.level,
        is_remote: opp.is_remote,
        location: opp.location || "",
        max_applicants: opp.max_applicants || 10,
        deadline: opp.deadline ? new Date(opp.deadline).toISOString().split("T")[0] : "",
      });
    }
  }, [data?.opportunity, form]);

  const watchedSkills = form.watch("skills_required");
  const isRemote = form.watch("is_remote");

  const addSkill = (skill: string) => {
    if (skill && !watchedSkills.includes(skill)) {
      form.setValue("skills_required", [...watchedSkills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    form.setValue("skills_required", watchedSkills.filter((s) => s !== skill));
  };

  const onSubmit = async (formData: EditFormData) => {
    if (!id) return;
    try {
      await updateOpportunity.mutateAsync({
        id,
        data: {
          title: formData.title,
          company_name: formData.company_name,
          description: formData.description,
          skills_required: formData.skills_required,
          duration_hours: formData.duration_hours,
          level: formData.level,
          is_remote: formData.is_remote,
          location: formData.is_remote ? null : formData.location || null,
          max_applicants: formData.max_applicants || null,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        },
      });

      // Invalidate all relevant caches so students see updated data
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity-details", id] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-opportunities"] });

      toast({
        title: "Opportunity Updated",
        description: "Your changes are now visible to students.",
      });
      navigate(-1);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update opportunity";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 max-w-4xl">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Opportunity not found or you don't have access.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-muted/30">
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Opportunity</h1>
          <p className="text-muted-foreground">Update your opportunity details — changes will be visible to students immediately.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opportunity Title *</FormLabel>
                    <FormControl><Input placeholder="e.g., Frontend Development Micro-Internship" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="company_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name *</FormLabel>
                    <FormControl><Input placeholder="Your company name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl><Textarea placeholder="Describe the opportunity..." rows={6} {...field} /></FormControl>
                    <FormDescription>Minimum 50 characters</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="skills_required" render={() => (
                  <FormItem>
                    <FormLabel>Required Skills *</FormLabel>
                    <div className="flex gap-2">
                      <Select onValueChange={addSkill}>
                        <SelectTrigger className="flex-1"><SelectValue placeholder="Select a skill" /></SelectTrigger>
                        <SelectContent>
                          {SKILL_OPTIONS.filter((s) => !watchedSkills.includes(s)).map((skill) => (
                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Or type custom skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(skillInput); } }} className="flex-1" />
                      <Button type="button" variant="outline" onClick={() => addSkill(skillInput)}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="gap-1">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">×</button>
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="level" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="duration_hours" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (hours) *</FormLabel>
                      <FormControl>
                        <Input type="number" min={10} max={160} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormDescription>10-160 hours</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* Location & Settings */}
            <Card>
              <CardHeader><CardTitle>Location & Settings</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="is_remote" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FormLabel className="text-base">Remote Opportunity</FormLabel>
                      <FormDescription>Students can work from anywhere</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
                {!isRemote && (
                  <FormField control={form.control} name="location" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl><Input placeholder="e.g., New York, NY" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="max_applicants" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Applicants</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="deadline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>

            {/* Existing Tasks (read-only) */}
            {data.tasks && data.tasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Existing Tasks</CardTitle>
                  <CardDescription>Tasks cannot be edited after posting to protect student submissions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.tasks.map((task, index) => (
                    <div key={task.id} className="flex gap-3 p-3 rounded-lg border bg-muted/50">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{task.title}</p>
                        {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" disabled={updateOpportunity.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {updateOpportunity.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
