import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold";

    const variants = {
      default: "bg-neutral-700 text-neutral-200",
      primary: "bg-primary-500 text-neutral-0",
      success: "bg-success-500 text-neutral-0",
      warning: "bg-secondary-500 text-neutral-950",
      error: "bg-error-500 text-neutral-0",
      info: "bg-primary-800 text-primary-200",
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export default Badge;
