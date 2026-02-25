import { Clock, Building2, MapPin, Calendar, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Opportunity {
  id: string;
  title: string;
  company_name: string;
  company_logo?: string | null;
  description: string;
  skills_required: string[];
  duration_hours: number;
  level: "beginner" | "intermediate" | "advanced";
  is_remote: boolean;
  location: string | null;
  created_at: string;
  filled?: boolean;
}

interface OpportunityListCardProps {
  opportunity: Opportunity;
  onViewDetails: (id: string) => void;
}

const levelColors = {
  beginner: "bg-success/10 text-success border-success/20",
  intermediate: "bg-warning/10 text-warning border-warning/20",
  advanced: "bg-destructive/10 text-destructive border-destructive/20",
};

const levelLabels = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

// Map duration hours to readable format
function getDurationLabel(hours: number): string {
  if (hours <= 40) return "1 week";
  if (hours <= 80) return "2 weeks";
  if (hours <= 120) return "3 weeks";
  return "1 month+";
}

// Generate a consistent icon based on title
function getOpportunityIcon(title: string): string {
  const icons = ["🚀", "📊", "🎨", "☁️", "✅", "🤖", "💻", "📱", "🔧", "📈"];
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return icons[hash % icons.length];
}

export function OpportunityListCard({ opportunity, onViewDetails }: OpportunityListCardProps) {
  const icon = getOpportunityIcon(opportunity.title);
  const durationLabel = getDurationLabel(opportunity.duration_hours);

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4">
          {/* Company Logo or Icon */}
          <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted flex items-center justify-center text-xl sm:text-2xl overflow-hidden">
            {opportunity.company_logo ? (
              <img src={opportunity.company_logo} alt={opportunity.company_name} className="w-full h-full object-cover rounded-lg" />
            ) : (
              icon
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg leading-tight mb-1 truncate">
                  {opportunity.title}
                </h3>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs sm:text-sm">
                  <Building2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span className="truncate">{opportunity.company_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {opportunity.filled && (
                  <Badge variant="destructive" className="text-[10px] sm:text-xs px-1.5 sm:px-2.5">
                    🔒 Filled
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 sm:px-2.5">
                  {opportunity.is_remote ? "Remote" : "On-site"}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-xs sm:text-sm mt-2 line-clamp-2 break-words">
              {opportunity.description}
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
              {opportunity.skills_required.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-[10px] sm:text-xs font-normal px-1.5 sm:px-2.5">
                  {skill}
                </Badge>
              ))}
              {opportunity.skills_required.length > 3 && (
                <Badge variant="outline" className="text-[10px] sm:text-xs font-normal px-1.5 sm:px-2.5">
                  +{opportunity.skills_required.length - 3} more
                </Badge>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {durationLabel}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className={`px-1.5 py-0.5 rounded text-[10px] sm:text-xs ${levelColors[opportunity.level]}`}>
                    {levelLabels[opportunity.level]}
                  </span>
                </span>
                {opportunity.location && !opportunity.is_remote && (
                  <span className="hidden sm:flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {opportunity.location}
                  </span>
                )}
              </div>

              <Button size="sm" className="w-full sm:w-auto" onClick={() => onViewDetails(opportunity.id)}>
                View Details
              </Button>
            </div>

            {/* Posted date */}
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3">
              Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
