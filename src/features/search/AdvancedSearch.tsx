import { Search, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="container py-8">
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

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy as (value: string) => void}>
              <SelectTrigger className="w-40 h-12 hidden sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Most Relevant</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
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

          {/* Results */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))
            ) : results && results.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Found {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                <AnimatePresence mode="popLayout">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SearchResultCard result={result} index={index} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </>
            ) : query || hasActiveFilters ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your search or filters to find what you're looking for
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Start searching</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Type a keyword or use the filters to discover opportunities
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
