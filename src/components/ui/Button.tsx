import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "default", disabled, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 focus:ring-offset-neutral-900";

    const variants = {
      primary: cn(
        "bg-primary-500 text-neutral-0",
        !disabled && "hover:bg-primary-600 active:bg-primary-700"
      ),
      secondary: cn(
        "bg-neutral-700 text-neutral-100 border border-neutral-600",
        !disabled && "hover:bg-neutral-600 active:bg-neutral-800"
      ),
      ghost: cn(
        "bg-transparent text-primary-400",
        !disabled && "hover:bg-primary-950 active:bg-primary-900"
      ),
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs font-medium",
      default: "px-5 py-2.5 text-sm font-semibold",
      lg: "px-6 py-3 text-base font-semibold",
    };

    const disabledStyles = disabled
      ? "bg-neutral-700 text-neutral-500 cursor-not-allowed border-transparent"
      : "";

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          disabled && disabledStyles,
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export default Button;
