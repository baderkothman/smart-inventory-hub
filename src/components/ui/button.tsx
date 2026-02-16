import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Fluent-ish base
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium tracking-[-0.01em]",
    "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
    "select-none",
    "disabled:pointer-events-none disabled:opacity-60",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
    "focus-visible:border-ring",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "border border-transparent",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85 shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 active:bg-secondary/70",
        outline:
          "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        ghost:
          "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 active:bg-destructive/85 focus-visible:ring-destructive/20",
        link: "bg-transparent text-primary border-transparent hover:underline underline-offset-4",
      },
      size: {
        default: "h-9 px-4",
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3",
        lg: "h-10 px-6",
        icon: "h-9 w-9 p-0",
        "icon-xs": "h-7 w-7 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
