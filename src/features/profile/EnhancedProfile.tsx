 import { Navbar } from "@/components/Navbar";
 import { LoadingSpinner } from "@/components/animations/LoadingSpinner";
 import { useStudentProfile } from "./hooks/useStudentProfile";
 import { ProfileHeader } from "./components/ProfileHeader";
 import { AboutSection } from "./components/AboutSection";
 import { SkillsSection } from "./components/SkillsSection";
 import { ProjectsSection } from "./components/ProjectsSection";
 import { ExperienceSection } from "./components/ExperienceSection";
 
 interface EnhancedProfileProps {
   userId?: string;
 }
 
 export function EnhancedProfile({ userId }: EnhancedProfileProps) {
   const {
     profile,
     skills,
     projects,
     experience,
     isLoading,
     isOwnProfile,
     updateProfile,
     addSkill,
     removeSkill,
     addProject,
     removeProject,
     addExperience,
     removeExperience,
   } = useStudentProfile(userId);
 
   if (isLoading) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
         <Navbar />
         <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
           <LoadingSpinner />
         </div>
       </div>
     );
   }
 
   if (!profile) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
         <Navbar />
         <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
           <p className="text-muted-foreground">Profile not found</p>
         </div>
       </div>
     );
   }
 
   return (
     <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
       <Navbar />
       <main id="main-content" className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
         <ProfileHeader
           profile={profile}
           isOwnProfile={isOwnProfile}
           onSave={(updates) => updateProfile.mutate(updates)}
           isSaving={updateProfile.isPending}
         />
 
         <AboutSection
           aboutMe={profile.about_me}
           isOwnProfile={isOwnProfile}
           onSave={(aboutMe) => updateProfile.mutate({ about_me: aboutMe })}
           isSaving={updateProfile.isPending}
         />
 
         <SkillsSection
           skills={skills}
           isOwnProfile={isOwnProfile}
           onAdd={(skill) => addSkill.mutate(skill)}
           onRemove={(skillId) => removeSkill.mutate(skillId)}
         />
 
         <ProjectsSection
           projects={projects}
           isOwnProfile={isOwnProfile}
           onAdd={(project) => addProject.mutate(project)}
           onRemove={(projectId) => removeProject.mutate(projectId)}
         />
 
         <ExperienceSection
           experience={experience}
           isOwnProfile={isOwnProfile}
           onAdd={(exp) => addExperience.mutate(exp)}
           onRemove={(expId) => removeExperience.mutate(expId)}
         />
       </main>
     </div>
   );
 }