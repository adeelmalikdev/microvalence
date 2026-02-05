 import { motion } from "framer-motion";
 import { Users, Eye, LogOut, MessageCircle } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import type { AlumniGroup } from "../hooks/useAlumniGroups";
 
 interface GroupCardProps {
   group: AlumniGroup;
   onJoin: (groupId: string) => Promise<boolean>;
   onLeave: (groupId: string) => Promise<boolean>;
 }
 
 export function GroupCard({ group, onJoin, onLeave }: GroupCardProps) {
   const navigate = useNavigate();
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       whileHover={{ y: -4 }}
       className="bg-card/80 backdrop-blur-sm rounded-2xl border-2 border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-all duration-300 overflow-hidden"
     >
       {/* Cover */}
       <div className="relative h-32 bg-gradient-to-br from-primary/30 to-accent/20">
         {group.cover_image && (
           <img
             src={group.cover_image}
             alt={group.name}
             className="w-full h-full object-cover"
           />
         )}
         <div className="absolute bottom-2 right-2 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium flex items-center gap-1">
           <Users className="h-3 w-3" />
           {group.member_count} members
         </div>
         {group.is_member && (
           <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
             {group.user_role === "admin" ? "Admin" : "Member"}
           </div>
         )}
       </div>
 
       {/* Content */}
       <div className="p-4">
         <h3 className="font-semibold text-lg text-foreground mb-1">{group.name}</h3>
         {group.description && (
           <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
             {group.description}
           </p>
         )}
         <span className="inline-block px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium mb-4">
           {group.field}
         </span>
 
         <div className="flex gap-2">
           {group.is_member ? (
             <>
               <Button
                 variant="default"
                 size="sm"
                 className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                 onClick={() => navigate(`/student/alumni/groups/${group.id}`)}
               >
                 <MessageCircle className="h-4 w-4" />
                 Chat
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => onLeave(group.id)}
                 className="text-muted-foreground hover:text-destructive"
               >
                 <LogOut className="h-4 w-4" />
               </Button>
             </>
           ) : (
             <>
               <Button
                 variant="default"
                 size="sm"
                 className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                 onClick={() => onJoin(group.id)}
               >
                 <Users className="h-4 w-4" />
                 Join
               </Button>
               <Button
                 variant="ghost"
                 size="icon"
                 className="h-8 w-8"
                 onClick={() => navigate(`/student/alumni/groups/${group.id}`)}
               >
                 <Eye className="h-4 w-4" />
               </Button>
             </>
           )}
         </div>
       </div>
     </motion.div>
   );
 }