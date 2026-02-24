 import { useState } from "react";
 import { motion } from "framer-motion";
 import { Filter, Users, TrendingUp, GraduationCap, BookOpen } from "lucide-react";
 import { useAlumniPosts } from "./hooks/useAlumniPosts";
 import { CreatePostForm } from "./components/CreatePostForm";
 import { AlumniPostCard } from "./components/AlumniPostCard";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 
const FILTERS = [
  { value: "all", label: "All Posts", icon: null },
  { value: "update", label: "Updates", icon: null },
  { value: "achievement", label: "Achievements", icon: null },
  { value: "job_posting", label: "Jobs", icon: null },
  { value: "advice", label: "Advice", icon: null },
  { value: "event", label: "Events", icon: null },
] as const;

const PEOPLE_FILTERS = [
  { value: "everyone", label: "Everyone", icon: Users },
  { value: "alumni-only", label: "Alumni Only", icon: GraduationCap },
  { value: "students", label: "Students Only", icon: BookOpen },
] as const;
 
export function AlumniFeed() {
  const [filter, setFilter] = useState("all");
  const [peopleFilter, setPeopleFilter] = useState("everyone");
  const { posts, isLoading, refetch } = useAlumniPosts(filter);

  // Client-side people filter
  const filteredPosts = posts.filter((post) => {
    if (peopleFilter === "alumni-only") return post.author_profile?.is_alumni === true;
    if (peopleFilter === "students") return !post.author_profile?.is_alumni;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-xl translate-x-1 translate-y-1 blur-sm" />
            <div className="absolute inset-0 bg-primary/30 rounded-xl translate-x-0.5 translate-y-0.5" />
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(var(--primary)/0.4)]">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alumni Feed</h1>
            <p className="text-sm text-muted-foreground">
              Connect with alumni and share updates
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Trending
        </Button>
      </div>

      {/* Create Post */}
      <CreatePostForm onPostCreated={refetch} />

      {/* People Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PEOPLE_FILTERS.map((f) => (
          <motion.button
            key={f.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPeopleFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              peopleFilter === f.value
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <f.icon className="h-3.5 w-3.5" />
            {f.label}
          </motion.button>
        ))}
      </div>
 
       {/* Filters */}
       <div className="flex items-center gap-2 overflow-x-auto pb-2">
         <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
         {FILTERS.map((f) => (
           <motion.button
             key={f.value}
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             onClick={() => setFilter(f.value)}
             className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
               filter === f.value
                 ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.4)]"
                 : "bg-muted/50 text-muted-foreground hover:bg-muted"
             }`}
           >
             {f.label}
           </motion.button>
         ))}
       </div>
 
       {/* Posts */}
       <div className="space-y-4">
         {isLoading ? (
           // Loading skeletons
           Array.from({ length: 3 }).map((_, i) => (
             <div
               key={i}
               className="bg-card/80 rounded-2xl border-2 border-primary/20 p-4 space-y-4"
             >
               <div className="flex gap-3">
                 <Skeleton className="h-12 w-12 rounded-full" />
                 <div className="space-y-2">
                   <Skeleton className="h-4 w-32" />
                   <Skeleton className="h-3 w-24" />
                 </div>
               </div>
               <Skeleton className="h-20 w-full" />
               <div className="flex gap-4">
                 <Skeleton className="h-8 w-20" />
                 <Skeleton className="h-8 w-20" />
                 <Skeleton className="h-8 w-20" />
               </div>
             </div>
           ))
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {peopleFilter !== "everyone"
                  ? `No posts from ${peopleFilter === "alumni-only" ? "alumni" : "students"} yet.`
                  : "No posts yet. Be the first to share something!"}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <AlumniPostCard key={post.id} post={post} onDelete={refetch} />
            ))
         )}
       </div>
     </div>
   );
 }
 
 export default AlumniFeed;