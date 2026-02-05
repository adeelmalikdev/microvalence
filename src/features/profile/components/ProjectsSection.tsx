 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Plus, X, FolderGit2, ExternalLink, Github } from "lucide-react";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Badge } from "@/components/ui/badge";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import type { StudentProject } from "../hooks/useStudentProfile";
 
 interface ProjectsSectionProps {
   projects: StudentProject[];
   isOwnProfile: boolean;
   onAdd: (project: Omit<StudentProject, "id" | "user_id" | "created_at">) => void;
   onRemove: (projectId: string) => void;
 }
 
 const emptyProject = {
   title: "",
   description: "",
   tech_stack: [] as string[],
   project_url: "",
   github_url: "",
   image_url: "",
   start_date: "",
   end_date: "",
 };
 
 export function ProjectsSection({ projects, isOwnProfile, onAdd, onRemove }: ProjectsSectionProps) {
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [newProject, setNewProject] = useState(emptyProject);
   const [techInput, setTechInput] = useState("");
 
   const handleAdd = () => {
     if (!newProject.title.trim()) return;
     onAdd({
       ...newProject,
       description: newProject.description || null,
       project_url: newProject.project_url || null,
       github_url: newProject.github_url || null,
       image_url: newProject.image_url || null,
       start_date: newProject.start_date || null,
       end_date: newProject.end_date || null,
     });
     setNewProject(emptyProject);
     setIsDialogOpen(false);
   };
 
   const addTech = () => {
     if (!techInput.trim()) return;
     setNewProject({
       ...newProject,
       tech_stack: [...newProject.tech_stack, techInput.trim()],
     });
     setTechInput("");
   };
 
   const removeTech = (index: number) => {
     setNewProject({
       ...newProject,
       tech_stack: newProject.tech_stack.filter((_, i) => i !== index),
     });
   };
 
   return (
     <GlassContainer className="p-6">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
           <FolderGit2 className="h-5 w-5 text-primary" />
           Projects
         </h2>
         {isOwnProfile && (
           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
             <DialogTrigger asChild>
               <EmeraldButton variant="ghost" size="sm">
                 <Plus className="h-4 w-4" />
               </EmeraldButton>
             </DialogTrigger>
             <DialogContent className="max-w-lg">
               <DialogHeader>
                 <DialogTitle>Add Project</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 mt-4">
                 <Input
                   value={newProject.title}
                   onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                   placeholder="Project Title"
                 />
                 <Textarea
                   value={newProject.description}
                   onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                   placeholder="Description"
                   rows={3}
                 />
                 <div>
                   <div className="flex gap-2 mb-2">
                     <Input
                       value={techInput}
                       onChange={(e) => setTechInput(e.target.value)}
                       placeholder="Add technology"
                       onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                     />
                     <EmeraldButton variant="outline" size="sm" onClick={addTech}>
                       Add
                     </EmeraldButton>
                   </div>
                   <div className="flex flex-wrap gap-1">
                     {newProject.tech_stack.map((tech, idx) => (
                       <Badge key={idx} variant="secondary" className="pr-1">
                         {tech}
                         <button onClick={() => removeTech(idx)} className="ml-1">
                           <X className="h-3 w-3" />
                         </button>
                       </Badge>
                     ))}
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <Input
                     value={newProject.project_url}
                     onChange={(e) => setNewProject({ ...newProject, project_url: e.target.value })}
                     placeholder="Live URL"
                   />
                   <Input
                     value={newProject.github_url}
                     onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                     placeholder="GitHub URL"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-sm text-muted-foreground">Start Date</label>
                     <Input
                       type="date"
                       value={newProject.start_date}
                       onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                     />
                   </div>
                   <div>
                     <label className="text-sm text-muted-foreground">End Date</label>
                     <Input
                       type="date"
                       value={newProject.end_date}
                       onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                     />
                   </div>
                 </div>
                 <EmeraldButton className="w-full" onClick={handleAdd}>
                   Add Project
                 </EmeraldButton>
               </div>
             </DialogContent>
           </Dialog>
         )}
       </div>
 
       <div className="grid gap-4 md:grid-cols-2">
         <AnimatePresence>
           {projects.map((project) => (
             <motion.div
               key={project.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="relative group"
             >
               <div className="p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 transition-colors">
                 {isOwnProfile && (
                   <button
                     onClick={() => onRemove(project.id)}
                     className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 )}
                 <h3 className="font-semibold text-foreground">{project.title}</h3>
                 {project.description && (
                   <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                     {project.description}
                   </p>
                 )}
                 {project.tech_stack && project.tech_stack.length > 0 && (
                   <div className="flex flex-wrap gap-1 mt-2">
                     {project.tech_stack.map((tech, idx) => (
                       <Badge key={idx} variant="outline" className="text-xs">
                         {tech}
                       </Badge>
                     ))}
                   </div>
                 )}
                 <div className="flex gap-2 mt-3">
                   {project.project_url && (
                     <a
                       href={project.project_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-primary hover:text-primary/80 transition-colors"
                     >
                       <ExternalLink className="h-4 w-4" />
                     </a>
                   )}
                   {project.github_url && (
                     <a
                       href={project.github_url}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="text-muted-foreground hover:text-primary transition-colors"
                     >
                       <Github className="h-4 w-4" />
                     </a>
                   )}
                 </div>
               </div>
             </motion.div>
           ))}
         </AnimatePresence>
         {projects.length === 0 && (
           <p className="text-muted-foreground text-sm col-span-2">No projects added yet</p>
         )}
       </div>
     </GlassContainer>
   );
 }