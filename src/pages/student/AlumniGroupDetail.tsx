 import { Navbar } from "@/components/Navbar";
 import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
 import { GroupDetail } from "@/features/alumni-connect/GroupDetail";
 
 export default function AlumniGroupDetail() {
   return (
     <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
       <Navbar />
       <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
        {/* Back Button */}
        <BackButton fallbackPath="/student/alumni/groups" className="mb-6" />

         <GroupDetail />
       </main>
       <Footer />
     </div>
   );
 }