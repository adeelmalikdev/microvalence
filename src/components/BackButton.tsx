 import { ArrowLeft } from "lucide-react";
 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 
 interface BackButtonProps {
   fallbackPath?: string;
   className?: string;
 }
 
 export function BackButton({ fallbackPath, className }: BackButtonProps) {
   const navigate = useNavigate();
 
   const handleBack = () => {
     if (window.history.length > 2) {
       navigate(-1);
     } else if (fallbackPath) {
       navigate(fallbackPath);
     } else {
       navigate("/");
     }
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       className={className}
     >
       <Button
         variant="ghost"
         size="sm"
         onClick={handleBack}
         className="gap-2 text-muted-foreground hover:text-foreground"
       >
         <ArrowLeft className="h-4 w-4" />
         Back
       </Button>
     </motion.div>
   );
 }