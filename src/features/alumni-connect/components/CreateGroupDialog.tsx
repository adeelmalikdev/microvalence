 import { useState } from "react";
 import { motion } from "framer-motion";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Textarea } from "@/components/ui/textarea";
 import { Label } from "@/components/ui/label";
 import { Plus, Users } from "lucide-react";
 
 const FIELD_OPTIONS = [
   "Technology",
   "Finance",
   "Healthcare",
   "Education",
   "Marketing",
   "Engineering",
   "Design",
   "Consulting",
   "Legal",
   "Other",
 ];
 
 interface CreateGroupDialogProps {
   onCreateGroup: (data: { name: string; description: string; field: string }) => Promise<any>;
 }
 
 export function CreateGroupDialog({ onCreateGroup }: CreateGroupDialogProps) {
   const [open, setOpen] = useState(false);
   const [name, setName] = useState("");
   const [description, setDescription] = useState("");
   const [field, setField] = useState("");
   const [isLoading, setIsLoading] = useState(false);
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!name.trim() || !field) return;
 
     setIsLoading(true);
     const result = await onCreateGroup({
       name: name.trim(),
       description: description.trim(),
       field,
     });
 
     if (result) {
       setName("");
       setDescription("");
       setField("");
       setOpen(false);
     }
     setIsLoading(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>
         <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
           <Plus className="h-4 w-4" />
           Create Group
         </Button>
       </DialogTrigger>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <Users className="h-5 w-5 text-primary" />
             Create Alumni Group
           </DialogTitle>
         </DialogHeader>
 
         <form onSubmit={handleSubmit} className="space-y-4 mt-4">
           <div className="space-y-2">
             <Label htmlFor="name">Group Name</Label>
             <Input
               id="name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="e.g., Tech Alumni Network"
               required
             />
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="description">Description</Label>
             <Textarea
               id="description"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="What is this group about?"
               rows={3}
             />
           </div>
 
           <div className="space-y-2">
             <Label>Field / Industry</Label>
             <div className="flex flex-wrap gap-2">
               {FIELD_OPTIONS.map((option) => (
                 <motion.button
                   key={option}
                   type="button"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => setField(option)}
                   className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                     field === option
                       ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                       : "bg-muted text-muted-foreground hover:bg-muted/80"
                   }`}
                 >
                   {option}
                 </motion.button>
               ))}
             </div>
           </div>
 
           <div className="flex justify-end gap-2 pt-4">
             <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
               Cancel
             </Button>
             <Button
               type="submit"
               disabled={!name.trim() || !field || isLoading}
               className="bg-primary hover:bg-primary/90"
             >
               {isLoading ? "Creating..." : "Create Group"}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }