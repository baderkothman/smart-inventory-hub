import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its children as text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("uses default variant data attribute when no variant is passed", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "default");
  });

  it("applies the supplied variant via data-variant attribute", () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "destructive",
    );
  });

  it("applies the secondary variant correctly", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveAttribute(
      "data-variant",
      "secondary",
    );
  });

  it("applies the supplied size via data-size attribute", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");
  });

  it("is disabled and not interactive when the disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("renders as a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/dashboard">Go to dashboard</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Go to dashboard" })).toBeInTheDocument();
  });

  it("forwards additional className to the element", () => {
    render(<Button className="my-custom-class">Styled</Button>);
    expect(screen.getByRole("button")).toHaveClass("my-custom-class");
  });
});
