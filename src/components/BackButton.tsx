 import { ArrowLeft } from "lucide-react";
 import { useNavigate, useLocation } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Button } from "@/components/ui/button";
 
 interface BackButtonProps {
   fallbackPath?: string;
   className?: string;
 }
 
 export function BackButton({ fallbackPath, className }: BackButtonProps) {
   const navigate = useNavigate();
   const location = useLocation();
 
   const handleBack = () => {
     // Check if we have navigation history (state from previous route)
     // or if history length indicates we can go back
     const canGoBack = window.history.state?.idx > 0;
     
     if (canGoBack) {
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