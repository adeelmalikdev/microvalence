 import { useState } from "react";
 import { Edit2, Save, X, User } from "lucide-react";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { Textarea } from "@/components/ui/textarea";
 
 interface AboutSectionProps {
   aboutMe: string | null;
   isOwnProfile: boolean;
   onSave: (aboutMe: string) => void;
   isSaving: boolean;
 }
 
 export function AboutSection({ aboutMe, isOwnProfile, onSave, isSaving }: AboutSectionProps) {
   const [isEditing, setIsEditing] = useState(false);
   const [editValue, setEditValue] = useState(aboutMe || "");
 
   const handleSave = () => {
     onSave(editValue);
     setIsEditing(false);
   };
 
   return (
     <GlassContainer className="p-6">
       <div className="flex items-center justify-between mb-4">
         <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
           <User className="h-5 w-5 text-primary" />
           About
         </h2>
         {isOwnProfile && !isEditing && (
           <EmeraldButton variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
             <Edit2 className="h-4 w-4" />
           </EmeraldButton>
         )}
       </div>
 
       {isEditing ? (
         <div className="space-y-3">
           <Textarea
             value={editValue}
             onChange={(e) => setEditValue(e.target.value)}
             placeholder="Tell us about yourself, your interests, goals, and what makes you unique..."
             rows={6}
             className="resize-none"
           />
           <div className="flex justify-end gap-2">
             <EmeraldButton
               variant="ghost"
               size="sm"
               onClick={() => {
                 setEditValue(aboutMe || "");
                 setIsEditing(false);
               }}
             >
               <X className="h-4 w-4 mr-1" />
               Cancel
             </EmeraldButton>
             <EmeraldButton size="sm" onClick={handleSave} isLoading={isSaving}>
               <Save className="h-4 w-4 mr-1" />
               Save
             </EmeraldButton>
           </div>
         </div>
       ) : (
         <p className="text-muted-foreground whitespace-pre-wrap">
           {aboutMe || "No description yet. Add an about section to tell others about yourself."}
         </p>
       )}
     </GlassContainer>
   );
 }