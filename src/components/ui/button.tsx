import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center font-mono font-medium uppercase tracking-widest border border-solid cursor-pointer select-none transition-all duration-150 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none rounded-none whitespace-nowrap gap-2.5",
  {
    variants: {
      variant: {
        default:
          "bg-surface border-border text-sci-bone hover:border-border-active hover:text-sci-green hover:shadow-[var(--glow-green)] focus-visible:border-border-active focus-visible:shadow-[var(--glow-green)]",
        exec:
          "bg-transparent border-sci-green text-sci-green hover:bg-sci-green hover:text-background hover:shadow-[var(--glow-green)] focus-visible:shadow-[var(--glow-green)]",
        destructive:
          "bg-transparent border-sci-red text-sci-red hover:bg-sci-red hover:text-background hover:shadow-[var(--glow-red)] focus-visible:shadow-[var(--glow-red)]",
        warning:
          "bg-transparent border-sci-amber text-sci-amber hover:bg-sci-amber hover:text-background hover:shadow-[0_0_10px_rgba(255,136,0,0.4)] focus-visible:shadow-[0_0_10px_rgba(255,136,0,0.4)]",
        info:
          "bg-transparent border-sci-green text-sci-green hover:bg-sci-green hover:text-background hover:shadow-[0_0_10px_rgba(0,237,63,0.4)] focus-visible:shadow-[0_0_10px_rgba(0,237,63,0.4)]",
        ghost:
          "border-transparent bg-transparent text-text-secondary hover:text-sci-bone hover:bg-surface-raised",
      },
      size: {
        default: "h-11 px-6 text-[0.875rem]",
        sm: "h-7 px-3 text-[0.65rem]",
        lg: "h-14 px-8 text-[1rem]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
