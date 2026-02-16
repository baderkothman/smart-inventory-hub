import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    // Fluent pill
    "inline-flex items-center justify-center gap-1",
    "h-6 px-2.5",
    "rounded-full border",
    "text-[11px] font-medium tracking-[-0.01em]",
    "whitespace-nowrap select-none",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
    "focus-visible:border-ring",
    "[&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-transparent hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
        outline:
          "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        ghost:
          "bg-transparent text-foreground border-transparent hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-white border-transparent hover:bg-destructive/90 focus-visible:ring-destructive/20",
        link: "bg-transparent border-transparent text-primary hover:underline underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
