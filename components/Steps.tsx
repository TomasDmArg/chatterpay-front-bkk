import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface Step {
  label: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  className?: string
}

/**
 * Steps component to show a progress indicator
 * @param steps Array of steps with labels and optional descriptions
 * @param currentStep Current active step (0-based index)
 * @param className Optional additional classes
 */
export function Steps({ 
  steps, 
  currentStep,
  className 
}: StepsProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex w-full justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isLast = index === steps.length - 1

          return (
            <div
              key={step.label}
              className={cn(
                "relative flex flex-col items-center",
                !isLast && "w-full"
              )}
            >
              {/* Bar */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[50%] top-[15px] h-[2px] w-full",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
              
              {/* Circle */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isActive && "border-primary bg-primary text-primary-foreground",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  !isActive && !isCompleted && "border-muted bg-background"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center">
                <div
                  className={cn(
                    "text-sm font-medium",
                    isActive && "text-primary",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}