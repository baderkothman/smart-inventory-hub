import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        [
          // Calm Fluent input: subtle border, no "button-like" shadow
          "h-9 w-full min-w-0 rounded-md border border-input",
          "bg-background text-foreground",
          "px-3 py-1 text-[14px] leading-5",
          "placeholder:text-muted-foreground",
          "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",
          "outline-none",

          // Hover + focus
          "hover:border-ring/40",
          "focus-visible:border-ring",
          "focus-visible:ring-4 focus-visible:ring-ring/20",

          // Invalid
          "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",

          // Disabled
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",

          // File input
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",

          // Selection
          "selection:bg-primary selection:text-primary-foreground",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export { Input };
