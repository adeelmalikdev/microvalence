import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassContainerProps {
  children: React.ReactNode;
  variant?: "light" | "medium" | "emerald";
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  hover?: boolean;
  className?: string;
  as?: "div" | "section" | "article";
}

const variantStyles = {
  light: "bg-background/70 border-background/30",
  medium: "bg-background/50 border-primary/20",
  emerald: "bg-primary/10 border-primary/30",
};

const blurStyles = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

const hoverEffect = {
  scale: 1.02,
  boxShadow: "0 0 40px hsl(var(--primary) / 0.5)",
  transition: { duration: 0.3 },
};

export const GlassContainer = React.forwardRef<
  HTMLDivElement,
  GlassContainerProps
>(({
  children,
  variant = "medium",
  blur = "md",
  glow = false,
  hover = true,
  className,
  as: Component = "div",
}, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative rounded-2xl border",
        variantStyles[variant],
        blurStyles[blur],
        glow && "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
        !glow && "shadow-[0_8px_32px_hsl(var(--primary)/0.15)]",
        className
      )}
      whileHover={hover ? hoverEffect : undefined}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
});

GlassContainer.displayName = "GlassContainer";

export default GlassContainer;
