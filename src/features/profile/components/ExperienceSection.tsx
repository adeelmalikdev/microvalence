 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Plus, X, Briefcase, MapPin } from "lucide-react";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Checkbox } from "@/components/ui/checkbox";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import { format } from "date-fns";
 import type { StudentExperience } from "../hooks/useStudentProfile";
 
 interface ExperienceSectionProps {
   experience: StudentExperience[];
   isOwnProfile: boolean;
   onAdd: (exp: Omit<StudentExperience, "id" | "user_id" | "created_at">) => void;
   onRemove: (expId: string) => void;
 }
 
 const emptyExperience = {
   company: "",
   position: "",
   description: "",
   start_date: "",
   end_date: "",
   is_current: false,
   location: "",
 };
 
 export function ExperienceSection({ experience, isOwnProfile, onAdd, onRemove }: ExperienceSectionProps) {
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [newExp, setNewExp] = useState(emptyExperience);
 
   const handleAdd = () => {
     if (!newExp.company.trim() || !newExp.position.trim() || !newExp.start_date) return;
     onAdd({
       ...newExp,
       description: newExp.description || null,
       end_date: newExp.is_current ? null : (newExp.end_date || null),
       location: newExp.location || null,
     });
     setNewExp(emptyExperience);
     setIsDialogOpen(false);
   };
 
   const formatDateRange = (start: string, end: string | null, isCurrent: boolean) => {
     const startDate = format(new Date(start), "MMM yyyy");
     if (isCurrent) return `${startDate} - Present`;
     if (end) return `${startDate} - ${format(new Date(end), "MMM yyyy")}`;
     return startDate;
   };
 
   return (
     <GlassContainer className="p-6">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
           <Briefcase className="h-5 w-5 text-primary" />
           Experience
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
                 <DialogTitle>Add Experience</DialogTitle>
               </DialogHeader>
               <div className="space-y-4 mt-4">
                 <Input
                   value={newExp.position}
                   onChange={(e) => setNewExp({ ...newExp, position: e.target.value })}
                   placeholder="Position/Title"
                 />
                 <Input
                   value={newExp.company}
                   onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                   placeholder="Company"
                 />
                 <Input
                   value={newExp.location}
                   onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                   placeholder="Location (optional)"
                 />
                 <Textarea
                   value={newExp.description}
                   onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                   placeholder="Description (optional)"
                   rows={3}
                 />
                 <div className="flex items-center gap-2">
                   <Checkbox
                     id="is_current"
                     checked={newExp.is_current}
                     onCheckedChange={(checked) => setNewExp({ ...newExp, is_current: !!checked })}
                   />
                   <label htmlFor="is_current" className="text-sm text-muted-foreground">
                     I currently work here
                   </label>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-sm text-muted-foreground">Start Date *</label>
                     <Input
                       type="date"
                       value={newExp.start_date}
                       onChange={(e) => setNewExp({ ...newExp, start_date: e.target.value })}
                       required
                     />
                   </div>
                   {!newExp.is_current && (
                     <div>
                       <label className="text-sm text-muted-foreground">End Date</label>
                       <Input
                         type="date"
                         value={newExp.end_date}
                         onChange={(e) => setNewExp({ ...newExp, end_date: e.target.value })}
                       />
                     </div>
                   )}
                 </div>
                 <EmeraldButton className="w-full" onClick={handleAdd}>
                   Add Experience
                 </EmeraldButton>
               </div>
             </DialogContent>
           </Dialog>
         )}
       </div>
 
       <div className="space-y-4">
         <AnimatePresence>
           {experience.map((exp) => (
             <motion.div
               key={exp.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="relative group flex gap-4"
             >
               {/* Timeline dot */}
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-primary" />
                 <div className="w-0.5 flex-1 bg-border" />
               </div>
 
               <div className="flex-1 pb-6">
                 {isOwnProfile && (
                   <button
                     onClick={() => onRemove(exp.id)}
                     className="absolute top-0 right-0 p-1 rounded-full bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 )}
                 <h3 className="font-semibold text-foreground">{exp.position}</h3>
                 <p className="text-primary">{exp.company}</p>
                 <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                   <span>{formatDateRange(exp.start_date, exp.end_date, exp.is_current)}</span>
                   {exp.location && (
                     <span className="flex items-center gap-1">
                       <MapPin className="h-3 w-3" />
                       {exp.location}
                     </span>
                   )}
                 </div>
                 {exp.description && (
                   <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                 )}
               </div>
             </motion.div>
           ))}
         </AnimatePresence>
         {experience.length === 0 && (
           <p className="text-muted-foreground text-sm">No experience added yet</p>
         )}
       </div>
     </GlassContainer>
   );
 }