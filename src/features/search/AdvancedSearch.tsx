 import { Search, SlidersHorizontal } from "lucide-react";
 import { motion, AnimatePresence } from "framer-motion";
 import { Navbar } from "@/components/Navbar";
 import { BackButton } from "@/components/BackButton";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Skeleton } from "@/components/ui/skeleton";
 import { SearchFilters } from "./components/SearchFilters";
 import { SearchResultCard } from "./components/SearchResultCard";
 import { useAdvancedSearch } from "./hooks/useAdvancedSearch";
 import { useState } from "react";
 import { cn } from "@/lib/utils";
 
 export default function AdvancedSearch() {
   const {
     query,
     setQuery,
     filters,
     results,
     loading,
     sortBy,
     setSortBy,
     clearFilters,
     toggleFilter,
     toggleRemote,
     hasActiveFilters,
   } = useAdvancedSearch();
 
   const [showMobileFilters, setShowMobileFilters] = useState(false);
 
   return (
     <div className="min-h-screen bg-background">
       <Navbar userRole="student" />
 
       <main className="container py-8">
         <BackButton fallbackPath="/student/dashboard" className="mb-6" />
 
         {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold mb-2">Advanced Search</h1>
           <p className="text-muted-foreground">
             Find opportunities that match your skills and interests
           </p>
         </div>
 
         <div className="flex gap-8">
           {/* Filters Sidebar - Desktop */}
           <div className="hidden lg:block">
             <SearchFilters
               filters={filters}
               onToggleFilter={toggleFilter}
               onToggleRemote={toggleRemote}
               onClearFilters={clearFilters}
               hasActiveFilters={hasActiveFilters}
             />
           </div>
 
           {/* Main Content */}
           <div className="flex-1 min-w-0">
             {/* Search Bar */}
             <div className="flex items-center gap-3 mb-6">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input
                   type="text"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="Search opportunities, companies, skills..."
                   className="pl-12 h-12 text-base"
                 />
               </div>
 
               {/* Mobile Filter Toggle */}
               <Button
                 variant="outline"
                 size="icon"
                 className="lg:hidden h-12 w-12"
                 onClick={() => setShowMobileFilters(!showMobileFilters)}
               >
                 <SlidersHorizontal className="h-5 w-5" />
               </Button>
             </div>
 
             {/* Mobile Filters */}
             <AnimatePresence>
               {showMobileFilters && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: "auto", opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="lg:hidden mb-6 overflow-hidden"
                 >
                   <SearchFilters
                     filters={filters}
                     onToggleFilter={toggleFilter}
                     onToggleRemote={toggleRemote}
                     onClearFilters={clearFilters}
                     hasActiveFilters={hasActiveFilters}
                   />
                 </motion.div>
               )}
             </AnimatePresence>
 
             {/* Results Header */}
             <div className="flex items-center justify-between mb-4">
               <p className="text-sm text-muted-foreground">
                 {loading ? "Searching..." : `${results.length} results found`}
               </p>
               <Select
                 value={sortBy}
                 onValueChange={(value) => setSortBy(value as "recent" | "relevant")}
               >
                 <SelectTrigger className="w-[150px]">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="recent">Most Recent</SelectItem>
                   <SelectItem value="relevant">Most Relevant</SelectItem>
                 </SelectContent>
               </Select>
             </div>
 
             {/* Results */}
             <div className="space-y-4">
               {loading ? (
                 Array.from({ length: 4 }).map((_, i) => (
                   <div key={i} className="rounded-lg border bg-card p-5">
                     <div className="flex gap-4">
                       <Skeleton className="w-12 h-12 rounded-lg" />
                       <div className="flex-1 space-y-3">
                         <Skeleton className="h-5 w-3/4" />
                         <Skeleton className="h-4 w-1/4" />
                         <Skeleton className="h-4 w-full" />
                         <div className="flex gap-2">
                           <Skeleton className="h-6 w-16" />
                           <Skeleton className="h-6 w-16" />
                           <Skeleton className="h-6 w-16" />
                         </div>
                       </div>
                     </div>
                   </div>
                 ))
               ) : results.length > 0 ? (
                 <AnimatePresence mode="popLayout">
                   {results.map((result, index) => (
                     <SearchResultCard
                       key={result.id}
                       result={result}
                       index={index}
                     />
                   ))}
                 </AnimatePresence>
               ) : (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="text-center py-12 border rounded-lg bg-muted/30"
                 >
                   <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                   <p className="text-muted-foreground mb-2">No results found</p>
                   <p className="text-sm text-muted-foreground">
                     Try adjusting your filters or search query
                   </p>
                 </motion.div>
               )}
             </div>
           </div>
         </div>
       </main>
     </div>
   );
 }