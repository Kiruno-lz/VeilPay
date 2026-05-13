import React from "react";
import { cn } from "../../lib/utils";

export interface StepIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement> {
  steps: { label: string; description?: string }[];
  currentStep: number;
}

const StepIndicator = React.forwardRef<HTMLDivElement, StepIndicatorProps>(
  ({ className, steps, currentStep, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center w-full", className)} {...props}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200",
                    isActive && "bg-primary-500 text-neutral-0",
                    isCompleted && "bg-success-500 text-neutral-0",
                    !isActive && !isCompleted &&
                      "bg-neutral-700 text-neutral-400 border border-neutral-600"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {step.label && (
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium",
                      isActive && "text-primary-400",
                      isCompleted && "text-success-500",
                      !isActive && !isCompleted && "text-neutral-500"
                    )}
                  >
                    {step.label}
                  </span>
                )}
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 mx-2 -mt-5">
                  <div
                    className={cn(
                      "h-0.5 transition-colors duration-200",
                      isCompleted ? "bg-primary-500" : "bg-neutral-700"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
);

StepIndicator.displayName = "StepIndicator";

export default StepIndicator;
