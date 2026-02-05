 import { motion } from "framer-motion";
 import { MapPin, Clock, Briefcase } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import type { SearchResult } from "../hooks/useAdvancedSearch";
 
 interface SearchResultCardProps {
   result: SearchResult;
   index: number;
 }
 
 export function SearchResultCard({ result, index }: SearchResultCardProps) {
   const navigate = useNavigate();
 
   const formatDuration = (hours: number) => {
     if (hours <= 40) return "~1 week";
     if (hours <= 80) return "~2 weeks";
     if (hours <= 120) return "~3 weeks";
     return "1 month+";
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: index * 0.05 }}
     >
       <GlassContainer variant="light" hover className="p-5">
         <div className="flex gap-4">
           {/* Company Avatar */}
           <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
             {result.company_name?.[0] || "C"}
           </div>
 
           <div className="flex-1 min-w-0">
             {/* Title & Company */}
             <h3 className="font-semibold text-foreground truncate">
               {result.title}
             </h3>
             <p className="text-sm text-muted-foreground">{result.company_name}</p>
 
             {/* Description */}
             <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
               {result.description}
             </p>
 
             {/* Meta Info */}
             <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
               <span className="flex items-center gap-1">
                 <Clock className="h-3 w-3" />
                 {formatDuration(result.duration_hours)}
               </span>
               <span className="flex items-center gap-1">
                 <Briefcase className="h-3 w-3" />
                 {result.level}
               </span>
               {result.location && (
                 <span className="flex items-center gap-1">
                   <MapPin className="h-3 w-3" />
                   {result.is_remote ? "Remote" : result.location}
                 </span>
               )}
               {result.is_remote && !result.location && (
                 <Badge variant="secondary" className="text-xs">
                   Remote
                 </Badge>
               )}
             </div>
 
             {/* Skills */}
             {result.skills_required.length > 0 && (
               <div className="flex flex-wrap gap-1.5 mt-3">
                 {result.skills_required.slice(0, 4).map((skill) => (
                   <Badge key={skill} variant="outline" className="text-xs">
                     {skill}
                   </Badge>
                 ))}
                 {result.skills_required.length > 4 && (
                   <Badge variant="outline" className="text-xs">
                     +{result.skills_required.length - 4}
                   </Badge>
                 )}
               </div>
             )}
           </div>
 
           {/* Action */}
           <Button
             variant="outline"
             size="sm"
             className="shrink-0 self-center"
             onClick={() => navigate(`/student/opportunities/${result.id}`)}
           >
             View Details
           </Button>
         </div>
       </GlassContainer>
     </motion.div>
   );
 }