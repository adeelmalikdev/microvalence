import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface EmeraldButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles = {
  primary: "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_4px_20px_hsl(var(--primary)/0.4)]",
  secondary: "bg-background/70 text-primary border border-primary/20 hover:bg-background/90",
  outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary/10",
  ghost: "bg-transparent text-primary hover:bg-primary/10",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm rounded-lg",
  md: "px-6 py-3 text-base rounded-xl",
  lg: "px-8 py-4 text-lg rounded-xl",
};

export const EmeraldButton = React.forwardRef<
  HTMLButtonElement,
  EmeraldButtonProps
>(({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}, ref) => {
  const isDisabledOrLoading = disabled || isLoading;

  return (
    <motion.button
      ref={ref}
      className={cn(
        "relative font-semibold overflow-hidden inline-flex items-center justify-center gap-2",
        "transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      whileHover={!isDisabledOrLoading ? { y: -4, boxShadow: "0 20px 40px hsl(var(--primary) / 0.3)" } : undefined}
      whileTap={!isDisabledOrLoading ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.3 }}
      disabled={isDisabledOrLoading}
      {...props}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-background/30 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span>{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon && <span>{rightIcon}</span>}
      </span>
    </motion.button>
  );
});

EmeraldButton.displayName = "EmeraldButton";

// Export hover effect presets for use in other components
export const emeraldHoverEffects = {
  cardLift: { y: -4, boxShadow: "0 20px 40px hsl(var(--primary) / 0.3)" },
  scale: { scale: 1.05 },
  glow: { boxShadow: "0 0 40px hsl(var(--primary) / 0.5)" },
};

export default EmeraldButton;
