import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react";

import { BackButton } from "@/components/BackButton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { OpportunityFilters } from "@/components/opportunities/OpportunityFilters";
import { OpportunityListCard } from "@/components/opportunities/OpportunityListCard";
import { useOpportunities } from "@/hooks/useOpportunities";
import { Skeleton } from "@/components/ui/skeleton";

interface FilterState {
  duration: string[];
  level: string[];
  skills: string[];
  type: string[];
}

export default function Opportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filters, setFilters] = useState<FilterState>({
    duration: [],
    level: [],
    skills: [],
    type: [],
  });

  const { data: opportunities, isLoading, error } = useOpportunities(
    { ...filters, search },
    sortBy
  );

  const sortLabel = sortBy === "recent" ? "Most Recent" : "Oldest First";

  const handleViewDetails = (id: string) => {
    navigate(`/student/opportunities/${id}`);
  };

  return (
    <div className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <BackButton fallbackPath="/student/dashboard" className="mb-4 sm:mb-6" />

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Explore Opportunities</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find micro-internships that match your skills
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar - hidden on mobile */}
        <div className="hidden lg:block">
          <OpportunityFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search, Filter button (mobile), and Sort */}
          <div className="flex items-center gap-2 sm:gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mobile filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 pb-0">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <OpportunityFilters filters={filters} onFilterChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 shrink-0 hidden sm:flex">
                  {sortLabel}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("recent")}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                  Oldest First
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Opportunities List */}
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-4 sm:p-5">
                  <div className="flex gap-3 sm:gap-4">
                    <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">
                  Failed to load opportunities. Please try again.
                </p>
              </div>
            ) : opportunities && opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <OpportunityListCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <p className="text-muted-foreground mb-2">No opportunities found</p>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>

          {!isLoading && opportunities && opportunities.length > 0 && (
            <p className="text-sm text-muted-foreground mt-6 text-center">
              Showing {opportunities.length} opportunity{opportunities.length !== 1 ? "ies" : "y"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
