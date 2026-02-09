import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquare, Users } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { AlumniGroups as AlumniGroupsComponent } from "@/features/alumni-connect/AlumniGroups";
 
 export default function AlumniGroups() {
  const navigate = useNavigate();

    return (
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <BackButton fallbackPath="/student/alumni" className="mb-6" />

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted/50 rounded-full p-1 gap-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student/alumni")}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <MessageSquare className="h-4 w-4" />
              Feed
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
            >
              <Users className="h-4 w-4" />
              Groups
            </motion.button>
          </div>
        </div>

          <AlumniGroupsComponent />
      </div>
    );
  }