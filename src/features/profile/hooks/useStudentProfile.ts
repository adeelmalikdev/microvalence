 import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { toast } from "sonner";
 
 export interface StudentSkill {
   id: string;
   user_id: string;
   skill_name: string;
   proficiency: "beginner" | "intermediate" | "advanced" | "expert";
   created_at: string;
 }
 
 export interface StudentProject {
   id: string;
   user_id: string;
   title: string;
   description: string | null;
   tech_stack: string[];
   project_url: string | null;
   github_url: string | null;
   image_url: string | null;
   start_date: string | null;
   end_date: string | null;
   created_at: string;
 }
 
 export interface StudentExperience {
   id: string;
   user_id: string;
   company: string;
   position: string;
   description: string | null;
   start_date: string;
   end_date: string | null;
   is_current: boolean;
   location: string | null;
   created_at: string;
 }
 
 export interface StudentCertification {
   id: string;
   user_id: string;
   name: string;
   issuer: string;
   issue_date: string;
   expiry_date: string | null;
   credential_url: string | null;
   created_at: string;
 }
 
 export interface ExtendedProfile {
   id: string;
   user_id: string;
   email: string;
   full_name: string | null;
   avatar_url: string | null;
   cover_image: string | null;
   bio: string | null;
   about_me: string | null;
   university: string | null;
   major: string | null;
   graduation_year: number | null;
   gpa: number | null;
   location: string | null;
   github_url: string | null;
   portfolio_url: string | null;
 status: "freshman" | "sophomore" | "junior" | "senior" | "graduated" | "alumni" | null;
 semester: number | null;
 website: string | null;
 resume_url: string | null;
 }
 
 export function useStudentProfile(userId?: string) {
   const { user } = useAuth();
   const queryClient = useQueryClient();
   const targetUserId = userId || user?.id;
 
   const profileQuery = useQuery({
     queryKey: ["student-profile", targetUserId],
     queryFn: async () => {
       if (!targetUserId) throw new Error("No user ID");
       
       const { data, error } = await supabase
         .from("profiles")
         .select("*")
         .eq("user_id", targetUserId)
         .single();
       
       if (error) throw error;
       return data as ExtendedProfile;
     },
     enabled: !!targetUserId,
   });
 
   const skillsQuery = useQuery({
     queryKey: ["student-skills", targetUserId],
     queryFn: async () => {
       if (!targetUserId) throw new Error("No user ID");
       
       const { data, error } = await supabase
         .from("student_skills")
         .select("*")
         .eq("user_id", targetUserId)
         .order("created_at", { ascending: false });
       
       if (error) throw error;
       return (data || []) as StudentSkill[];
     },
     enabled: !!targetUserId,
   });
 
   const projectsQuery = useQuery({
     queryKey: ["student-projects", targetUserId],
     queryFn: async () => {
       if (!targetUserId) throw new Error("No user ID");
       
       const { data, error } = await supabase
         .from("student_projects")
         .select("*")
         .eq("user_id", targetUserId)
         .order("start_date", { ascending: false });
       
       if (error) throw error;
       return (data || []) as StudentProject[];
     },
     enabled: !!targetUserId,
   });
 
   const experienceQuery = useQuery({
     queryKey: ["student-experience", targetUserId],
     queryFn: async () => {
       if (!targetUserId) throw new Error("No user ID");
       
       const { data, error } = await supabase
         .from("student_experience")
         .select("*")
         .eq("user_id", targetUserId)
         .order("start_date", { ascending: false });
       
       if (error) throw error;
       return (data || []) as StudentExperience[];
     },
     enabled: !!targetUserId,
   });
 
   const certificationsQuery = useQuery({
     queryKey: ["student-certifications", targetUserId],
     queryFn: async () => {
       if (!targetUserId) throw new Error("No user ID");
       
       const { data, error } = await supabase
         .from("student_certifications")
         .select("*")
         .eq("user_id", targetUserId)
         .order("issue_date", { ascending: false });
       
       if (error) throw error;
       return (data || []) as StudentCertification[];
     },
     enabled: !!targetUserId,
   });
 
   const updateProfile = useMutation({
     mutationFn: async (updates: Partial<ExtendedProfile>) => {
       if (!user?.id) throw new Error("Not authenticated");
       
       const { error } = await supabase
         .from("profiles")
         .update(updates)
         .eq("user_id", user.id);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-profile", user?.id] });
       toast.success("Profile updated");
     },
     onError: () => toast.error("Failed to update profile"),
   });
 
   const addSkill = useMutation({
     mutationFn: async (skill: { skill_name: string; proficiency: string }) => {
       if (!user?.id) throw new Error("Not authenticated");
       
       const { error } = await supabase
         .from("student_skills")
         .insert([{ skill_name: skill.skill_name, proficiency: skill.proficiency as "beginner" | "intermediate" | "advanced" | "expert", user_id: user.id }]);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-skills", user?.id] });
       toast.success("Skill added");
     },
     onError: () => toast.error("Failed to add skill"),
   });
 
   const removeSkill = useMutation({
     mutationFn: async (skillId: string) => {
       const { error } = await supabase
         .from("student_skills")
         .delete()
         .eq("id", skillId);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-skills", user?.id] });
       toast.success("Skill removed");
     },
   });
 
   const addProject = useMutation({
     mutationFn: async (project: Omit<StudentProject, "id" | "user_id" | "created_at">) => {
       if (!user?.id) throw new Error("Not authenticated");
       
       const { error } = await supabase
         .from("student_projects")
         .insert([{ ...project, user_id: user.id }]);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-projects", user?.id] });
       toast.success("Project added");
     },
     onError: () => toast.error("Failed to add project"),
   });
 
   const removeProject = useMutation({
     mutationFn: async (projectId: string) => {
       const { error } = await supabase
         .from("student_projects")
         .delete()
         .eq("id", projectId);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-projects", user?.id] });
       toast.success("Project removed");
     },
   });
 
   const addExperience = useMutation({
     mutationFn: async (exp: Omit<StudentExperience, "id" | "user_id" | "created_at">) => {
       if (!user?.id) throw new Error("Not authenticated");
       
       const { error } = await supabase
         .from("student_experience")
         .insert([{ ...exp, user_id: user.id }]);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-experience", user?.id] });
       toast.success("Experience added");
     },
     onError: () => toast.error("Failed to add experience"),
   });
 
   const removeExperience = useMutation({
     mutationFn: async (expId: string) => {
       const { error } = await supabase
         .from("student_experience")
         .delete()
         .eq("id", expId);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-experience", user?.id] });
       toast.success("Experience removed");
     },
   });
 
   const addCertification = useMutation({
     mutationFn: async (cert: Omit<StudentCertification, "id" | "user_id" | "created_at">) => {
       if (!user?.id) throw new Error("Not authenticated");
       
       const { error } = await supabase
         .from("student_certifications")
         .insert([{ ...cert, user_id: user.id }]);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-certifications", user?.id] });
       toast.success("Certification added");
     },
     onError: () => toast.error("Failed to add certification"),
   });
 
   const removeCertification = useMutation({
     mutationFn: async (certId: string) => {
       const { error } = await supabase
         .from("student_certifications")
         .delete()
         .eq("id", certId);
       
       if (error) throw error;
     },
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["student-certifications", user?.id] });
       toast.success("Certification removed");
     },
   });
 
  return {
    profile: profileQuery.data,
    skills: skillsQuery.data || [],
    projects: projectsQuery.data || [],
    experience: experienceQuery.data || [],
    certifications: certificationsQuery.data || [],
    isLoading: profileQuery.isLoading, // Only wait for profile, rest loads progressively
    isSkillsLoading: skillsQuery.isLoading,
    isProjectsLoading: projectsQuery.isLoading,
    isExperienceLoading: experienceQuery.isLoading,
    isOwnProfile: user?.id === targetUserId,
    updateProfile,
    addSkill,
    removeSkill,
    addProject,
    removeProject,
    addExperience,
    removeExperience,
    addCertification,
    removeCertification,
  };
 }