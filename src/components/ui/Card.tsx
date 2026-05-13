import React from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "color-block" | "left-accent";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const baseStyles = "rounded-xl p-6";

    const variants = {
      default: "bg-neutral-800 border border-neutral-600",
      elevated: cn(
        "bg-neutral-700 border border-neutral-600",
        "shadow-lg shadow-black/50"
      ),
      "color-block": "bg-primary-800 text-neutral-100",
      "left-accent": cn(
        "bg-neutral-800 border border-neutral-600",
        "border-l-4 border-l-primary-500"
      ),
    };

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export default Card;
