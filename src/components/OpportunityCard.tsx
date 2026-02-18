import { Building2, Clock, GraduationCap, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTag } from "./SkillTag";

interface OpportunityCardProps {
  title: string;
  company: string;
  skills: string[];
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isRemote?: boolean;
  onViewDetails?: () => void;
}

export function OpportunityCard({
  title,
  company,
  skills,
  duration,
  level,
  isRemote = true,
  onViewDetails,
}: OpportunityCardProps) {
  return (
    <Card className="group relative overflow-hidden card-lift accent-bar-top border-border/60 bg-card hover:shadow-[var(--shadow-emerald-glow)]">
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/3 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
      
      <CardContent className="p-5 relative z-10">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{title}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Building2 className="h-4 w-4" />
              <span>{company}</span>
            </div>
          </div>
          {isRemote && <Badge variant="remote">Remote</Badge>}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill) => (
            <SkillTag key={skill} skill={skill} />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {duration}
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {level}
            </span>
          </div>
          <Button size="sm" onClick={onViewDetails} className="group/btn gap-1.5 rounded-full shadow-[var(--shadow-emerald-glow)] hover:shadow-[var(--glow-hover)] transition-all duration-300">
            Apply
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
