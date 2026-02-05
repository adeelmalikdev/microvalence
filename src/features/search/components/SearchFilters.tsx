 import { Filter, X } from "lucide-react";
 import { Checkbox } from "@/components/ui/checkbox";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { Separator } from "@/components/ui/separator";
 import { Badge } from "@/components/ui/badge";
 import { GlassContainer } from "@/components/ui/GlassContainer";
 import type { SearchFilters as SearchFiltersType } from "../hooks/useAdvancedSearch";
 
 interface SearchFiltersProps {
   filters: SearchFiltersType;
   onToggleFilter: (category: keyof Omit<SearchFiltersType, "remote">, value: string) => void;
   onToggleRemote: () => void;
   onClearFilters: () => void;
   hasActiveFilters: boolean;
 }
 
 const FIELD_OPTIONS = [
   "Computer Science",
   "Information Technology",
   "Software Engineering",
   "Data Science",
   "UI/UX Design",
   "Marketing",
 ];
 
 const LEVEL_OPTIONS = [
   { value: "beginner", label: "Entry Level" },
   { value: "intermediate", label: "Intermediate" },
   { value: "advanced", label: "Advanced" },
 ];
 
 const SKILL_OPTIONS = [
   "React",
   "Python",
   "JavaScript",
   "TypeScript",
   "Node.js",
   "MongoDB",
   "UI/UX",
   "Figma",
   "TensorFlow",
   "Express",
 ];
 
 export function SearchFilters({
   filters,
   onToggleFilter,
   onToggleRemote,
   onClearFilters,
   hasActiveFilters,
 }: SearchFiltersProps) {
   return (
     <aside className="w-72 shrink-0">
       <GlassContainer variant="light" className="sticky top-24 p-5">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Filter className="h-4 w-4 text-primary" />
             <h3 className="font-semibold">Filters</h3>
           </div>
           {hasActiveFilters && (
             <Button
               variant="ghost"
               size="sm"
               onClick={onClearFilters}
               className="text-xs h-auto py-1 px-2"
             >
               Clear All
             </Button>
           )}
         </div>
 
         {/* Field Filter */}
         <div className="mb-4">
           <h4 className="text-sm font-medium mb-2">Field</h4>
           <div className="space-y-2">
             {FIELD_OPTIONS.map((field) => (
               <div key={field} className="flex items-center space-x-2">
                 <Checkbox
                   id={`field-${field}`}
                   checked={filters.field.includes(field)}
                   onCheckedChange={() => onToggleFilter("field", field)}
                 />
                 <Label
                   htmlFor={`field-${field}`}
                   className="text-sm font-normal cursor-pointer"
                 >
                   {field}
                 </Label>
               </div>
             ))}
           </div>
         </div>
 
         <Separator className="my-4" />
 
         {/* Level Filter */}
         <div className="mb-4">
           <h4 className="text-sm font-medium mb-2">Experience Level</h4>
           <div className="space-y-2">
             {LEVEL_OPTIONS.map((option) => (
               <div key={option.value} className="flex items-center space-x-2">
                 <Checkbox
                   id={`level-${option.value}`}
                   checked={filters.level.includes(option.value)}
                   onCheckedChange={() => onToggleFilter("level", option.value)}
                 />
                 <Label
                   htmlFor={`level-${option.value}`}
                   className="text-sm font-normal cursor-pointer"
                 >
                   {option.label}
                 </Label>
               </div>
             ))}
           </div>
         </div>
 
         <Separator className="my-4" />
 
         {/* Skills Filter */}
         <div className="mb-4">
           <h4 className="text-sm font-medium mb-2">Skills</h4>
           <div className="space-y-2 max-h-40 overflow-y-auto">
             {SKILL_OPTIONS.map((skill) => (
               <div key={skill} className="flex items-center space-x-2">
                 <Checkbox
                   id={`skill-${skill}`}
                   checked={filters.skills.includes(skill)}
                   onCheckedChange={() => onToggleFilter("skills", skill)}
                 />
                 <Label
                   htmlFor={`skill-${skill}`}
                   className="text-sm font-normal cursor-pointer"
                 >
                   {skill}
                 </Label>
               </div>
             ))}
           </div>
         </div>
 
         <Separator className="my-4" />
 
         {/* Remote Filter */}
         <div className="flex items-center space-x-2">
           <Checkbox
             id="remote-only"
             checked={filters.remote}
             onCheckedChange={onToggleRemote}
           />
           <Label htmlFor="remote-only" className="text-sm font-normal cursor-pointer">
             Remote Only
           </Label>
         </div>
 
         {/* Active Filters Display */}
         {hasActiveFilters && (
           <>
             <Separator className="my-4" />
             <div>
               <h4 className="text-sm font-medium mb-2">Active Filters</h4>
               <div className="flex flex-wrap gap-1.5">
                 {filters.field.map((f) => (
                   <Badge
                     key={f}
                     variant="secondary"
                     className="text-xs cursor-pointer"
                     onClick={() => onToggleFilter("field", f)}
                   >
                     {f}
                     <X className="h-3 w-3 ml-1" />
                   </Badge>
                 ))}
                 {filters.level.map((l) => (
                   <Badge
                     key={l}
                     variant="secondary"
                     className="text-xs cursor-pointer"
                     onClick={() => onToggleFilter("level", l)}
                   >
                     {l}
                     <X className="h-3 w-3 ml-1" />
                   </Badge>
                 ))}
                 {filters.skills.map((s) => (
                   <Badge
                     key={s}
                     variant="secondary"
                     className="text-xs cursor-pointer"
                     onClick={() => onToggleFilter("skills", s)}
                   >
                     {s}
                     <X className="h-3 w-3 ml-1" />
                   </Badge>
                 ))}
                 {filters.remote && (
                   <Badge
                     variant="secondary"
                     className="text-xs cursor-pointer"
                     onClick={onToggleRemote}
                   >
                     Remote
                     <X className="h-3 w-3 ml-1" />
                   </Badge>
                 )}
               </div>
             </div>
           </>
         )}
       </GlassContainer>
     </aside>
   );
 }