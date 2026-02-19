import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    // Clean, Fluent-style pill (shadcn-compatible)
    "inline-flex items-center gap-1",
    "rounded-full border border-border",
    "px-2.5 py-0.5",
    "text-[11px] font-medium leading-none tracking-[-0.01em]",
    "whitespace-nowrap select-none",
    "transition-colors",
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20",
    "[&>svg]:h-3 [&>svg]:w-3 [&>svg]:shrink-0 [&>svg]:pointer-events-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-transparent",
        secondary: "bg-secondary text-secondary-foreground",
        outline:
          "bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/90 focus-visible:ring-destructive/20",
        link: "border-transparent bg-transparent text-primary hover:underline underline-offset-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
