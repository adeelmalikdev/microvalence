import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Trash2, Save, Send, Upload, FileText, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateOpportunity } from "@/hooks/useRecruiterData";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  tasks: z.array(
    z.object({
      title: z.string().min(3, "Task title required"),
      description: z.string().min(10, "Task description required"),
      due_days: z.number().min(1).max(30),
    })
  ).min(1, "At least one task is required"),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

const SKILL_OPTIONS = [
  "React", "TypeScript", "JavaScript", "Python", "Node.js", "SQL",
  "Tailwind CSS", "Figma", "UI/UX", "Git", "REST APIs", "GraphQL",
  "Machine Learning", "Data Analysis", "AWS", "Docker", "MongoDB",
];

export default function PostOpportunity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const createOpportunity = useCreateOpportunity();
  const [skillInput, setSkillInput] = useState("");
  const [taskAttachments, setTaskAttachments] = useState<Record<number, { file: File; name: string } | null>>({});
  const [uploadingTask, setUploadingTask] = useState<number | null>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleTaskFileDrop = useCallback((index: number, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
      setTaskAttachments(prev => ({ ...prev, [index]: { file, name: file.name } }));
    } else {
      toast({ title: "Invalid file", description: "Only PDF files up to 10MB are allowed", variant: "destructive" });
    }
  }, [toast]);

  const handleTaskFileSelect = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf" && file.size <= 10 * 1024 * 1024) {
      setTaskAttachments(prev => ({ ...prev, [index]: { file, name: file.name } }));
    } else if (file) {
      toast({ title: "Invalid file", description: "Only PDF files up to 10MB are allowed", variant: "destructive" });
    }
  }, [toast]);

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      title: "",
      company_name: profile?.full_name || "",
      description: "",
      skills_required: [],
      duration_hours: 40,
      level: "beginner",
      is_remote: true,
      location: "",
      max_applicants: 10,
      deadline: "",
      tasks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tasks",
  });

  const watchedSkills = form.watch("skills_required");
  const isRemote = form.watch("is_remote");

  const addSkill = (skill: string) => {
    if (skill && !watchedSkills.includes(skill)) {
      form.setValue("skills_required", [...watchedSkills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    form.setValue(
      "skills_required",
      watchedSkills.filter((s) => s !== skill)
    );
  };

  const uploadTaskAttachment = async (taskIndex: number, userId: string): Promise<string | null> => {
    const attachment = taskAttachments[taskIndex];
    if (!attachment) return null;
    const filePath = `${userId}/${Date.now()}-${attachment.name}`;
    const { error } = await supabase.storage.from("opportunity-task-attachments").upload(filePath, attachment.file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("opportunity-task-attachments").getPublicUrl(filePath);
    return urlData.publicUrl;
  };

  const onSubmit = async (data: OpportunityFormData, status: "draft" | "published") => {
    try {
      const validTasks = data.tasks.filter(
        (task): task is { title: string; description: string; due_days: number } =>
          !!task.title && !!task.description && !!task.due_days
      );

      // Upload task attachments first
      const taskAttachmentUrls: Record<number, string | null> = {};
      for (const [indexStr] of Object.entries(taskAttachments)) {
        const idx = parseInt(indexStr);
        if (taskAttachments[idx]) {
          taskAttachmentUrls[idx] = await uploadTaskAttachment(idx, profile?.user_id || "anon");
        }
      }

      const tasksWithAttachments = validTasks.map((task, idx) => ({
        ...task,
        attachment_url: taskAttachmentUrls[idx] || undefined,
      }));

      await createOpportunity.mutateAsync({
        opportunity: {
          title: data.title,
          company_name: data.company_name,
          description: data.description,
          skills_required: data.skills_required,
          duration_hours: data.duration_hours,
          level: data.level,
          is_remote: data.is_remote,
          location: data.is_remote ? null : data.location || null,
          max_applicants: data.max_applicants || null,
          deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
          status,
          company_logo: profile?.company_logo || profile?.avatar_url || null,
        },
        tasks: tasksWithAttachments,
      });

      toast({
        title: status === "published" ? "Opportunity Published!" : "Draft Saved",
        description:
          status === "published"
            ? "Your opportunity is now visible to students."
            : "Your draft has been saved.",
      });

      navigate("/recruiter/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create opportunity";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-muted/30">
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Post New Opportunity
          </h1>
          <p className="text-muted-foreground">
            Create a micro-internship opportunity for students
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the essential details about the opportunity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opportunity Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Frontend Development Micro-Internship"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the opportunity, what students will learn, and what they'll be working on..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Minimum 50 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  Define the skills and experience level needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="skills_required"
                  render={() => (
                    <FormItem>
                      <FormLabel>Required Skills *</FormLabel>
                      <div className="flex gap-2">
                        <Select onValueChange={addSkill}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a skill" />
                          </SelectTrigger>
                          <SelectContent>
                            {SKILL_OPTIONS.filter(
                              (s) => !watchedSkills.includes(s)
                            ).map((skill) => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or type custom skill"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addSkill(skillInput);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => addSkill(skillInput)}
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {watchedSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience Level *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={10}
                            max={160}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          10-160 hours (~1 week to 1 month)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location & Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="is_remote"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <FormLabel className="text-base">
                          Remote Opportunity
                        </FormLabel>
                        <FormDescription>
                          Students can work from anywhere
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isRemote && (
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., New York, NY"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="max_applicants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Applicants</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Deadline</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className={form.formState.errors.tasks?.message ? "border-destructive" : ""}>
              <CardHeader>
                <CardTitle>Tasks *</CardTitle>
                <CardDescription>
                  Define the tasks students will complete during this
                  micro-internship (at least one required)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg border-muted-foreground/25">
                    <p className="text-muted-foreground text-sm mb-2">
                      No tasks added yet
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Add at least one task for students to complete
                    </p>
                  </div>
                )}
                
                {fields.map((field, index) => (
                  <Card key={field.id} className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-4">
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Task Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Build responsive dashboard"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe what the student should accomplish..."
                                    rows={3}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.due_days`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due (days after acceptance)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={30}
                                    {...field}
                                    onChange={(e) =>
                                      field.onChange(parseInt(e.target.value))
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* PDF Attachment Drop Zone */}
                          <div
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-primary"); }}
                            onDragLeave={(e) => { e.currentTarget.classList.remove("border-primary"); }}
                            onDrop={(e) => { e.currentTarget.classList.remove("border-primary"); handleTaskFileDrop(index, e); }}
                            className="border-2 border-dashed rounded-lg p-3 text-center transition-colors border-muted-foreground/25 hover:border-primary/50 cursor-pointer"
                            onClick={() => fileInputRefs.current[index]?.click()}
                          >
                            <input
                              type="file"
                              accept=".pdf"
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[index] = el; }}
                              onChange={(e) => handleTaskFileSelect(index, e)}
                            />
                            {taskAttachments[index] ? (
                              <div className="flex items-center justify-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="text-foreground font-medium truncate max-w-[200px]">{taskAttachments[index]!.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={(e) => { e.stopPropagation(); setTaskAttachments(prev => { const n = {...prev}; delete n[index]; return n; }); }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                                <Upload className="h-5 w-5" />
                                <span className="text-xs">Drag & drop a PDF or click to browse</span>
                                <span className="text-xs opacity-60">Max 10MB</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {form.formState.errors.tasks?.message && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.tasks.message}
                  </p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({ title: "", description: "", due_days: 7 })
                  }
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.handleSubmit((data) => onSubmit(data, "draft"))()}
                disabled={createOpportunity.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={() => form.handleSubmit((data) => onSubmit(data, "published"))()}
                disabled={createOpportunity.isPending}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                {createOpportunity.isPending ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
