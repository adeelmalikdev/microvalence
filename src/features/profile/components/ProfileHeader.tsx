 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Camera, Edit2, Save, MapPin, GraduationCap, Github, Globe, X, Link, FileText } from "lucide-react";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import { EmeraldButton } from "@/components/ui/EmeraldButton";
 import { Input } from "@/components/ui/input";
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
 import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
 import type { ExtendedProfile } from "../hooks/useStudentProfile";
 
 interface ProfileHeaderProps {
   profile: ExtendedProfile;
   isOwnProfile: boolean;
   onSave: (updates: Partial<ExtendedProfile>) => void;
   isSaving: boolean;
 }
 
function ensureAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
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
     status: profile.status || null,
     semester: profile.semester || null,
     website: profile.website || "",
     resume_url: profile.resume_url || "",
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
       status: profile.status || null,
       semester: profile.semester || null,
       website: profile.website || "",
       resume_url: profile.resume_url || "",
     });
     setIsEditing(false);
   };
 
    return (
      <GlassContainer className="overflow-hidden">
       {/* Cover Image */}
       <div className="w-full h-40 sm:h-52 bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden">
         {profile.cover_image && (
           <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />
         )}
       </div>

       {/* Profile Image Section */}
       <div className="relative p-6 -mt-12 z-10">
         {/* Edit Button - Top Right */}
         {isOwnProfile && (
           <div className="absolute top-4 right-4 flex gap-2">
             {isEditing ? (
               <>
                 <EmeraldButton variant="ghost" size="sm" onClick={handleCancel}>
                   <X className="h-4 w-4" />
                 </EmeraldButton>
                 <EmeraldButton size="sm" onClick={handleSave} isLoading={isSaving}>
                   <Save className="h-4 w-4 mr-1" />
                   Save
                 </EmeraldButton>
               </>
             ) : (
               <EmeraldButton variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                 <Edit2 className="h-4 w-4 mr-1" />
                 Edit Profile
               </EmeraldButton>
             )}
           </div>
         )}
 
        {/* Left-Aligned Profile Layout */}
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Round Profile Image */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-28 w-28 md:h-32 md:w-32 border-4 border-primary/20 shadow-xl ring-4 ring-background">
               <AvatarImage 
                 src={profile.avatar_url || undefined} 
                 alt={profile.full_name || "Profile"} 
                 className="object-cover"
               />
               <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                 {profile.full_name?.split(" ").map(n => n[0]).join("") || profile.email?.[0]?.toUpperCase() || "?"}
               </AvatarFallback>
             </Avatar>
             {isEditing && (
               <motion.button
                className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-lg"
                 whileHover={{ scale: 1.1 }}
                 whileTap={{ scale: 0.9 }}
               >
                 <Camera className="h-4 w-4" />
               </motion.button>
             )}
           </div>
 
          {/* Profile Info */}
          <div className="flex-1">
            {/* Name and Bio */}
             {isEditing ? (
              <div className="space-y-3">
                 <Input
                   value={editData.full_name}
                   onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                   placeholder="Full Name"
                  className="text-xl font-bold"
                 />
                 <Input
                   value={editData.bio}
                   onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                   placeholder="Headline (e.g., Software Engineer | Full-Stack Developer)"
                 />
               </div>
             ) : (
               <>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                   {profile.full_name || "Add your name"}
                 </h1>
                <p className="text-muted-foreground">
                   {profile.bio || "Add a headline"}
                 </p>
                 {profile.status && (
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">
                     {profile.status}
                   </span>
                 )}
               </>
             )}
 
            {/* Academic Info */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
             {isEditing ? (
              <div className="w-full space-y-3">
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
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   <Select
                     value={editData.status || ""}
                     onValueChange={(value) => setEditData({ ...editData, status: value as any })}
                   >
                     <SelectTrigger>
                       <SelectValue placeholder="Status" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="freshman">Freshman</SelectItem>
                       <SelectItem value="sophomore">Sophomore</SelectItem>
                       <SelectItem value="junior">Junior</SelectItem>
                       <SelectItem value="senior">Senior</SelectItem>
                       <SelectItem value="graduated">Graduated</SelectItem>
                       <SelectItem value="alumni">Alumni</SelectItem>
                     </SelectContent>
                   </Select>
                   <Input
                     type="number"
                     value={editData.semester || ""}
                     onChange={(e) => setEditData({ ...editData, semester: parseInt(e.target.value) || null })}
                     placeholder="Semester"
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
                 <Input
                   value={editData.location}
                   onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                   placeholder="Location"
                 />
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
                 <div className="grid grid-cols-2 gap-3">
                   <Input
                     value={editData.website}
                     onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                     placeholder="Personal Website"
                   />
                   <Input
                     value={editData.resume_url}
                     onChange={(e) => setEditData({ ...editData, resume_url: e.target.value })}
                     placeholder="Resume URL"
                   />
                 </div>
               </div>
             ) : (
               <>
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
                 {profile.semester && (
                   <span className="text-muted-foreground">
                     Semester {profile.semester}
                   </span>
                 )}
               </>
             )}
            </div>
 
            {/* Social Links */}
            {!isEditing && (
              <div className="flex gap-3 mt-3">
               {profile.github_url && (
                 <a
                   href={ensureAbsoluteUrl(profile.github_url)}
                   target="_blank"
                   rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                 >
                   <Github className="h-5 w-5" />
                 </a>
               )}
               {profile.portfolio_url && (
                 <a
                   href={ensureAbsoluteUrl(profile.portfolio_url)}
                   target="_blank"
                   rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                 >
                   <Globe className="h-5 w-5" />
                 </a>
               )}
               {profile.website && (
                 <a
                   href={ensureAbsoluteUrl(profile.website)}
                   target="_blank"
                   rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                 >
                   <Link className="h-5 w-5" />
                 </a>
               )}
               {profile.resume_url && (
                 <a
                   href={ensureAbsoluteUrl(profile.resume_url)}
                   target="_blank"
                   rel="noopener noreferrer"
                  className="p-2 rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                 >
                   <FileText className="h-5 w-5" />
                 </a>
               )}
              </div>
            )}
          </div>
         </div>
       </div>
     </GlassContainer>
   );
 }