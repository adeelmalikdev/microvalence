 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Camera, Edit2, Save, MapPin, GraduationCap, Github, Globe, X } from "lucide-react";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import type { ExtendedProfile } from "../hooks/useStudentProfile";
 
 interface ProfileHeaderProps {
   profile: ExtendedProfile;
   isOwnProfile: boolean;
   onSave: (updates: Partial<ExtendedProfile>) => void;
   isSaving: boolean;
 }
 
 export function ProfileHeader({ profile, isOwnProfile, onSave, isSaving }: ProfileHeaderProps) {
   const [isEditing, setIsEditing] = useState(false);
   const [editData, setEditData] = useState({
     full_name: profile.full_name || "",
     bio: profile.bio || "",
     university: profile.university || "",
     major: profile.major || "",
     location: profile.location || "",
     github_url: profile.github_url || "",
     portfolio_url: profile.portfolio_url || "",
     graduation_year: profile.graduation_year || new Date().getFullYear(),
     gpa: profile.gpa || null,
     about_me: profile.about_me || "",
   });
 
   const handleSave = () => {
     onSave(editData);
     setIsEditing(false);
   };
 
   const handleCancel = () => {
     setEditData({
       full_name: profile.full_name || "",
       bio: profile.bio || "",
       university: profile.university || "",
       major: profile.major || "",
       location: profile.location || "",
       github_url: profile.github_url || "",
       portfolio_url: profile.portfolio_url || "",
       graduation_year: profile.graduation_year || new Date().getFullYear(),
       gpa: profile.gpa || null,
       about_me: profile.about_me || "",
     });
     setIsEditing(false);
   };
 
   return (
     <GlassContainer className="overflow-hidden">
       {/* Cover Photo */}
       <div className="relative h-48 bg-gradient-to-r from-primary/30 via-primary/20 to-accent/30">
         {profile.cover_image && (
           <img
             src={profile.cover_image}
             alt="Cover"
             className="w-full h-full object-cover"
           />
         )}
         {isEditing && (
           <motion.button
             className="absolute bottom-4 right-4 p-2 rounded-full bg-background/80 backdrop-blur"
             whileHover={{ scale: 1.1 }}
             whileTap={{ scale: 0.9 }}
           >
             <Camera className="h-5 w-5 text-primary" />
           </motion.button>
         )}
       </div>
 
       {/* Profile Content */}
       <div className="relative px-6 pb-6">
         {/* Avatar */}
         <div className="absolute -top-16 left-6">
           <div className="relative">
             <div className="w-32 h-32 rounded-full border-4 border-background bg-gradient-to-br from-primary to-accent overflow-hidden shadow-lg">
               {profile.avatar_url ? (
                 <img
                   src={profile.avatar_url}
                   alt={profile.full_name || "Profile"}
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary-foreground">
                   {profile.full_name?.split(" ").map(n => n[0]).join("") || profile.email?.[0]?.toUpperCase() || "?"}
                 </div>
               )}
             </div>
             {isEditing && (
               <motion.button
                 className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg"
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
               >
                 <Camera className="h-4 w-4" />
               </motion.button>
             )}
           </div>
         </div>
 
         {/* Info Section */}
         <div className="pt-20">
           <div className="flex justify-between items-start">
             <div className="flex-1">
               {isEditing ? (
                 <div className="space-y-3">
                   <Input
                     value={editData.full_name}
                     onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                     placeholder="Full Name"
                     className="text-2xl font-bold"
                   />
                   <Input
                     value={editData.bio}
                     onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                     placeholder="Headline (e.g., Software Engineer | Full-Stack Developer)"
                   />
                   <div className="grid grid-cols-2 gap-3">
                     <Input
                       value={editData.university}
                       onChange={(e) => setEditData({ ...editData, university: e.target.value })}
                       placeholder="University"
                     />
                     <Input
                       value={editData.major}
                       onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                       placeholder="Major"
                     />
                   </div>
                   <div className="grid grid-cols-3 gap-3">
                     <Input
                       value={editData.location}
                       onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                       placeholder="Location"
                     />
                     <Input
                       type="number"
                       value={editData.graduation_year || ""}
                       onChange={(e) => setEditData({ ...editData, graduation_year: parseInt(e.target.value) || null })}
                       placeholder="Grad Year"
                     />
                     <Input
                       type="number"
                       step="0.01"
                       value={editData.gpa || ""}
                       onChange={(e) => setEditData({ ...editData, gpa: parseFloat(e.target.value) || null })}
                       placeholder="GPA"
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                     <Input
                       value={editData.github_url}
                       onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
                       placeholder="GitHub URL"
                     />
                     <Input
                       value={editData.portfolio_url}
                       onChange={(e) => setEditData({ ...editData, portfolio_url: e.target.value })}
                       placeholder="Portfolio URL"
                     />
                   </div>
                 </div>
               ) : (
                 <>
                   <h1 className="text-2xl font-bold text-foreground">
                     {profile.full_name || "Add your name"}
                   </h1>
                   <p className="text-muted-foreground mt-1">
                     {profile.bio || "Add a headline"}
                   </p>
                   <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                     {profile.university && (
                       <span className="flex items-center gap-1">
                         <GraduationCap className="h-4 w-4 text-primary" />
                         {profile.university}
                         {profile.major && ` • ${profile.major}`}
                         {profile.graduation_year && ` '${profile.graduation_year.toString().slice(-2)}`}
                       </span>
                     )}
                     {profile.location && (
                       <span className="flex items-center gap-1">
                         <MapPin className="h-4 w-4 text-primary" />
                         {profile.location}
                       </span>
                     )}
                     {profile.gpa && (
                       <span className="text-primary font-medium">
                         GPA: {profile.gpa.toFixed(2)}
                       </span>
                     )}
                   </div>
                   <div className="flex gap-3 mt-3">
                     {profile.github_url && (
                       <a
                         href={profile.github_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-muted-foreground hover:text-primary transition-colors"
                       >
                         <Github className="h-5 w-5" />
                       </a>
                     )}
                     {profile.portfolio_url && (
                       <a
                         href={profile.portfolio_url}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="text-muted-foreground hover:text-primary transition-colors"
                       >
                         <Globe className="h-5 w-5" />
                       </a>
                     )}
                   </div>
                 </>
               )}
             </div>
 
             {isOwnProfile && (
               <div className="flex gap-2">
                 {isEditing ? (
                   <>
                     <EmeraldButton
                       variant="ghost"
                       size="sm"
                       onClick={handleCancel}
                     >
                       <X className="h-4 w-4" />
                     </EmeraldButton>
                     <EmeraldButton
                       size="sm"
                       onClick={handleSave}
                       isLoading={isSaving}
                     >
                       <Save className="h-4 w-4 mr-1" />
                       Save
                     </EmeraldButton>
                   </>
                 ) : (
                   <EmeraldButton
                     variant="outline"
                     size="sm"
                     onClick={() => setIsEditing(true)}
                   >
                     <Edit2 className="h-4 w-4 mr-1" />
                     Edit Profile
                   </EmeraldButton>
                 )}
               </div>
             )}
           </div>
         </div>
       </div>
     </GlassContainer>
   );
 }