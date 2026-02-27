import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("has the data-slot=badge attribute", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test")).toHaveAttribute("data-slot", "badge");
  });

  it("uses default variant when no variant is supplied", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveAttribute(
      "data-variant",
      "default",
    );
  });

  it("applies the destructive variant", () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText("Error")).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  it("applies the outline variant", () => {
    render(<Badge variant="outline">Outlined</Badge>);
    expect(screen.getByText("Outlined")).toHaveAttribute(
      "data-variant",
      "outline",
    );
  });

  it("applies the secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText("Secondary")).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("forwards additional className", () => {
    render(<Badge className="extra-class">Tagged</Badge>);
    expect(screen.getByText("Tagged")).toHaveClass("extra-class");
  });

  it("renders as a child element when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/status">Status link</a>
      </Badge>,
    );
    expect(screen.getByRole("link", { name: "Status link" })).toBeInTheDocument();
  });
});
