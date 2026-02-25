import { motion } from "framer-motion";
import { Building2, Clock, GraduationCap, MapPin, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PremiumOpportunityCardProps {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  skills: string[];
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  isRemote?: boolean;
  isFilled?: boolean;
  location?: string;
  matchScore?: number;
  onViewDetails?: () => void;
  className?: string;
}

const levelConfig = {
  beginner: { label: "Beginner", color: "bg-success/10 text-success border-success/30" },
  intermediate: { label: "Intermediate", color: "bg-warning/10 text-warning border-warning/30" },
  advanced: { label: "Advanced", color: "bg-destructive/10 text-destructive border-destructive/30" },
};

export function PremiumOpportunityCard({
  id,
  title,
  company,
  companyLogo,
  skills,
  duration,
  level,
  isRemote = false,
  isFilled = false,
  location,
  matchScore,
  onViewDetails,
  className,
}: PremiumOpportunityCardProps) {
  const levelInfo = levelConfig[level];

  return (
    <motion.article
      className={cn(
        "group relative bg-card rounded-xl border border-border p-6 cursor-pointer overflow-hidden",
        "transition-shadow duration-300",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover="hover"
      onClick={onViewDetails}
      variants={{
        hover: { y: -4 },
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
        variants={{ hover: { opacity: 1 } }}
        transition={{ duration: 0.3 }}
      />

      {/* Glow effect (visible on hover) */}
      <motion.div
        className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 blur-sm -z-10"
        variants={{ hover: { opacity: 1 } }}
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {/* Company Logo with rotation on hover */}
            <motion.div
              className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border"
              variants={{ hover: { scale: 1.05, rotate: 3 } }}
              transition={{ duration: 0.2 }}
            >
              {companyLogo ? (
                <img src={companyLogo} alt={company} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </motion.div>

            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
          </div>

          {/* Filled Badge */}
          {isFilled && (
            <Badge className="bg-destructive/10 text-destructive border-destructive/20">🔒 Filled</Badge>
          )}

          {/* Match Score Badge */}
          {matchScore !== undefined && matchScore >= 70 && !isFilled && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Badge 
                className={cn(
                  "font-bold",
                  matchScore >= 90 
                    ? "bg-success/10 text-success border-success/30" 
                    : matchScore >= 80 
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-secondary/10 text-secondary border-secondary/30"
                )}
              >
                {matchScore}% Match
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Skills with staggered animation */}
        <motion.div 
          className="flex flex-wrap gap-2 mb-4"
          variants={{
            hover: {
              transition: { staggerChildren: 0.03 },
            },
          }}
        >
          {skills.slice(0, 4).map((skill, i) => (
            <motion.span
              key={skill}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              variants={{
                hover: { scale: 1.05, backgroundColor: "hsl(var(--accent)/0.2)" },
              }}
            >
              {skill}
            </motion.span>
          ))}
          {skills.length > 4 && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
              +{skills.length - 4} more
            </span>
          )}
        </motion.div>

        {/* Meta info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {duration}
            </span>
            <Badge variant="outline" className={cn("text-xs", levelInfo.color)}>
              <GraduationCap className="h-3 w-3 mr-1" />
              {levelInfo.label}
            </Badge>
            {isRemote ? (
              <span className="flex items-center gap-1 text-success">
                <Wifi className="h-4 w-4" />
                Remote
              </span>
            ) : location ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            ) : null}
          </div>

          {/* CTA Button */}
          <motion.div
            variants={{
              hover: { scale: 1.05 },
            }}
          >
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.();
              }}
            >
              View Details
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}