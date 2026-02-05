 import { Navbar } from "@/components/Navbar";
 import { Footer } from "@/components/Footer";
 import { AlumniGroups as AlumniGroupsComponent } from "@/features/alumni-connect/AlumniGroups";
 
 export default function AlumniGroups() {
   return (
     <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
       <Navbar />
       <main id="main-content" className="flex-1 container mx-auto px-4 py-8">
         <AlumniGroupsComponent />
       </main>
       <Footer />
     </div>
   );
 }