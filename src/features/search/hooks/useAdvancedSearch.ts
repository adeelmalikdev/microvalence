 import { useState, useEffect } from "react";
 import { useDebouncedCallback } from "use-debounce";
 import { supabase } from "@/integrations/supabase/client";
 
 export interface SearchFilters {
   field: string[];
   level: string[];
   location: string[];
   remote: boolean;
   skills: string[];
 }
 
 export interface SearchResult {
   id: string;
   title: string;
   company_name: string;
   description: string;
   level: string;
   is_remote: boolean;
   location: string | null;
   skills_required: string[];
   duration_hours: number;
   created_at: string;
 }
 
 const initialFilters: SearchFilters = {
   field: [],
   level: [],
   location: [],
   remote: false,
   skills: [],
 };
 
 export function useAdvancedSearch() {
   const [query, setQuery] = useState("");
   const [filters, setFilters] = useState<SearchFilters>(initialFilters);
   const [results, setResults] = useState<SearchResult[]>([]);
   const [loading, setLoading] = useState(false);
   const [sortBy, setSortBy] = useState<"recent" | "relevant">("recent");
 
   const debouncedSearch = useDebouncedCallback(async (searchQuery: string) => {
     setLoading(true);
 
     try {
       let dbQuery = supabase
         .from("opportunities")
         .select("*")
         .eq("status", "published");
 
       // Apply text search
       if (searchQuery) {
         dbQuery = dbQuery.or(
           `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`
         );
       }
 
       // Apply level filter
       if (filters.level.length > 0) {
         dbQuery = dbQuery.in("level", filters.level as ("beginner" | "intermediate" | "advanced")[]);
       }
 
       // Apply remote filter
       if (filters.remote) {
         dbQuery = dbQuery.eq("is_remote", true);
       }
 
       // Apply sorting
       if (sortBy === "recent") {
         dbQuery = dbQuery.order("created_at", { ascending: false });
       }
 
       const { data, error } = await dbQuery.limit(50);
 
       if (error) throw error;
 
       let filteredData = data || [];
 
       // Client-side filtering for skills (array contains)
       if (filters.skills.length > 0) {
         filteredData = filteredData.filter((opp) => {
           const oppSkills = opp.skills_required.map((s: string) => s.toLowerCase());
           return filters.skills.some((skill) =>
             oppSkills.includes(skill.toLowerCase())
           );
         });
       }
 
       setResults(filteredData);
     } catch (error) {
       console.error("Search error:", error);
       setResults([]);
     } finally {
       setLoading(false);
     }
   }, 300);
 
   useEffect(() => {
     debouncedSearch(query);
   }, [query, filters, sortBy]);
 
   const clearFilters = () => {
     setFilters(initialFilters);
   };
 
   const toggleFilter = (category: keyof Omit<SearchFilters, "remote">, value: string) => {
     const current = filters[category] as string[];
     const updated = current.includes(value)
       ? current.filter((v) => v !== value)
       : [...current, value];
     setFilters({ ...filters, [category]: updated });
   };
 
   const toggleRemote = () => {
     setFilters({ ...filters, remote: !filters.remote });
   };
 
   const hasActiveFilters =
     filters.field.length > 0 ||
     filters.level.length > 0 ||
     filters.skills.length > 0 ||
     filters.remote;
 
   return {
     query,
     setQuery,
     filters,
     setFilters,
     results,
     loading,
     sortBy,
     setSortBy,
     clearFilters,
     toggleFilter,
     toggleRemote,
     hasActiveFilters,
   };
 }