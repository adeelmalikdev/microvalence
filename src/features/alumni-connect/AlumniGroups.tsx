 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Users, Search, Filter } from "lucide-react";
 import { useAlumniGroups } from "./hooks/useAlumniGroups";
 import { GroupCard } from "./components/GroupCard";
 import { CreateGroupDialog } from "./components/CreateGroupDialog";
 import { Input } from "@/components/ui/input";
 import { Skeleton } from "@/components/ui/skeleton";
 
 const FIELD_FILTERS = [
   "All",
   "Technology",
   "Finance",
   "Healthcare",
   "Education",
   "Marketing",
   "Engineering",
   "Design",
 ];
 
 export function AlumniGroups() {
   const { groups, isLoading, joinGroup, leaveGroup, createGroup } =
     useAlumniGroups();
   const [searchQuery, setSearchQuery] = useState("");
   const [fieldFilter, setFieldFilter] = useState("All");
 
   const filteredGroups = groups.filter((group) => {
     const matchesSearch =
       group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       group.description?.toLowerCase().includes(searchQuery.toLowerCase());
     const matchesField = fieldFilter === "All" || group.field === fieldFilter;
     return matchesSearch && matchesField;
   });
 
   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex items-center justify-between flex-wrap gap-4">
         <div className="flex items-center gap-3">
           <div className="relative">
             <div className="absolute inset-0 bg-primary/20 rounded-xl translate-x-1 translate-y-1 blur-sm" />
             <div className="absolute inset-0 bg-primary/30 rounded-xl translate-x-0.5 translate-y-0.5" />
             <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
               <Users className="h-6 w-6 text-primary-foreground" />
             </div>
           </div>
           <div>
             <h1 className="text-2xl font-bold text-foreground">Alumni Groups</h1>
             <p className="text-sm text-muted-foreground">
               Join communities in your field
             </p>
           </div>
         </div>
 
         <CreateGroupDialog onCreateGroup={createGroup} />
       </div>
 
       {/* Search & Filter */}
       <div className="space-y-3">
         <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search groups..."
             className="pl-10 bg-background/50 border-primary/20"
           />
         </div>
 
         <div className="flex items-center gap-2 overflow-x-auto pb-2">
           <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
           {FIELD_FILTERS.map((field) => (
             <motion.button
               key={field}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setFieldFilter(field)}
               className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                 fieldFilter === field
                   ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                   : "bg-muted/50 text-muted-foreground hover:bg-muted"
               }`}
             >
               {field}
             </motion.button>
           ))}
         </div>
       </div>
 
       {/* Groups Grid */}
       {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {Array.from({ length: 6 }).map((_, i) => (
             <div
               key={i}
               className="bg-card/80 rounded-2xl border-2 border-primary/20 overflow-hidden"
             >
               <Skeleton className="h-32 w-full" />
               <div className="p-4 space-y-3">
                 <Skeleton className="h-5 w-3/4" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-6 w-20" />
                 <div className="flex gap-2">
                   <Skeleton className="h-9 flex-1" />
                   <Skeleton className="h-9 w-9" />
                 </div>
               </div>
             </div>
           ))}
         </div>
       ) : filteredGroups.length === 0 ? (
         <div className="text-center py-12">
           <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
           <p className="text-muted-foreground">
             {searchQuery || fieldFilter !== "All"
               ? "No groups match your search"
               : "No groups yet. Create the first one!"}
           </p>
         </div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredGroups.map((group) => (
             <GroupCard
               key={group.id}
               group={group}
               onJoin={joinGroup}
               onLeave={leaveGroup}
             />
           ))}
         </div>
       )}
     </div>
   );
 }
 
 export default AlumniGroups;