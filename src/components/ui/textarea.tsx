import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        [
          "min-h-20 w-full rounded-md border border-input",
          "bg-card text-foreground",
          "px-3 py-2 text-[14px] leading-6",
          "placeholder:text-muted-foreground",
          "shadow-sm",
          "outline-none",
          "transition-colors duration-150 ease-[cubic-bezier(0.2,0,0,1)]",

          // Hover + focus
          "hover:border-ring/40",
          "focus-visible:border-ring",
          "focus-visible:ring-4 focus-visible:ring-ring/20",

          // Invalid
          "aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/15",

          // Disabled
          "disabled:cursor-not-allowed disabled:opacity-60",
        ].join(" "),
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
