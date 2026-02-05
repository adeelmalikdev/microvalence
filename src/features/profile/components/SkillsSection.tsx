 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Plus, X, Code } from "lucide-react";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { Input } from "@/components/ui/input";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Badge } from "@/components/ui/badge";
 import type { StudentSkill } from "../hooks/useStudentProfile";
 
 interface SkillsSectionProps {
   skills: StudentSkill[];
   isOwnProfile: boolean;
   onAdd: (skill: { skill_name: string; proficiency: string }) => void;
   onRemove: (skillId: string) => void;
 }
 
 const proficiencyColors = {
   beginner: "bg-muted text-muted-foreground",
   intermediate: "bg-primary/20 text-primary",
   advanced: "bg-primary/40 text-primary-foreground",
   expert: "bg-primary text-primary-foreground",
 };
 
 export function SkillsSection({ skills, isOwnProfile, onAdd, onRemove }: SkillsSectionProps) {
   const [isAdding, setIsAdding] = useState(false);
   const [newSkill, setNewSkill] = useState({ skill_name: "", proficiency: "intermediate" });
 
   const handleAdd = () => {
     if (!newSkill.skill_name.trim()) return;
     onAdd(newSkill);
     setNewSkill({ skill_name: "", proficiency: "intermediate" });
     setIsAdding(false);
   };
 
   return (
     <GlassContainer className="p-6">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
           <Code className="h-5 w-5 text-primary" />
           Skills
         </h2>
         {isOwnProfile && !isAdding && (
           <EmeraldButton
             variant="ghost"
             size="sm"
             onClick={() => setIsAdding(true)}
           >
             <Plus className="h-4 w-4" />
           </EmeraldButton>
         )}
       </div>
 
       <AnimatePresence>
         {isAdding && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "auto" }}
             exit={{ opacity: 0, height: 0 }}
             className="mb-4 flex gap-2"
           >
             <Input
               value={newSkill.skill_name}
               onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
               placeholder="Skill name (e.g., React, Python)"
               className="flex-1"
               onKeyDown={(e) => e.key === "Enter" && handleAdd()}
             />
             <Select
               value={newSkill.proficiency}
               onValueChange={(value) => setNewSkill({ ...newSkill, proficiency: value })}
             >
               <SelectTrigger className="w-32">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="beginner">Beginner</SelectItem>
                 <SelectItem value="intermediate">Intermediate</SelectItem>
                 <SelectItem value="advanced">Advanced</SelectItem>
                 <SelectItem value="expert">Expert</SelectItem>
               </SelectContent>
             </Select>
             <EmeraldButton size="sm" onClick={handleAdd}>
               Add
             </EmeraldButton>
             <EmeraldButton variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
               <X className="h-4 w-4" />
             </EmeraldButton>
           </motion.div>
         )}
       </AnimatePresence>
 
       <div className="flex flex-wrap gap-2">
         <AnimatePresence>
           {skills.map((skill) => (
             <motion.div
               key={skill.id}
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.8 }}
               layout
             >
               <Badge
                 className={`${proficiencyColors[skill.proficiency]} group relative pr-6 cursor-default`}
               >
                 {skill.skill_name}
                 <span className="ml-1 text-xs opacity-70">
                   ({skill.proficiency})
                 </span>
                 {isOwnProfile && (
                   <button
                     onClick={() => onRemove(skill.id)}
                     className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <X className="h-3 w-3" />
                   </button>
                 )}
               </Badge>
             </motion.div>
           ))}
         </AnimatePresence>
         {skills.length === 0 && (
           <p className="text-muted-foreground text-sm">No skills added yet</p>
         )}
       </div>
     </GlassContainer>
   );
 }