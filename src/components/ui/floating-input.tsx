import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";

export interface FloatingInputProps extends Omit<React.ComponentProps<"input">, "placeholder"> {
  label: string;
  error?: string;
  success?: boolean;
  hint?: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, type: initialType, label, error, success, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || generatedId;
    
    const isPassword = initialType === "password";
    const type = isPassword && showPassword ? "text" : initialType;
    const showFloatingLabel = isFocused || hasValue;
    
    const borderColor = error
      ? "border-destructive focus:ring-destructive/30"
      : success
      ? "border-success focus:ring-success/30"
      : "border-input focus:ring-ring/30";

    return (
      <div className="relative w-full">
        <div className="relative">
          <motion.label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 pointer-events-none origin-left bg-background px-1 transition-colors",
              showFloatingLabel
                ? error
                  ? "text-destructive"
                  : success
                  ? "text-success"
                  : "text-primary"
                : "text-muted-foreground"
            )}
            initial={false}
            animate={{
              y: showFloatingLabel ? -12 : 12,
              scale: showFloatingLabel ? 0.85 : 1,
              x: 0,
            }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {label}
          </motion.label>
          
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "flex h-12 w-full rounded-lg border-2 bg-background px-3 pt-4 pb-2 text-base ring-offset-background",
              "transition-all duration-200",
              "focus:outline-none focus:ring-4",
              "disabled:cursor-not-allowed disabled:opacity-50",
              borderColor,
              isPassword && "pr-10",
              className,
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setHasValue(!!e.target.value);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          
          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {/* Success/Error icons */}
          {!isPassword && (success || error) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {error ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-success" />
              )}
            </motion.div>
          )}
        </div>
        
        {/* Error message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${inputId}-error`}
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 text-sm text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {/* Hint text */}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-muted-foreground">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { FloatingInput };