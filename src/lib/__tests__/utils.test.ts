import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("returns an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("returns a single class name unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple class names with a space", () => {
    expect(cn("foo", "bar", "baz")).toBe("foo bar baz");
  });

  it("ignores falsy values (false, null, undefined)", () => {
    expect(cn("base", false, null, undefined, "extra")).toBe("base extra");
  });

  it("handles conditional classes using short-circuit evaluation", () => {
    const active = true;
    const hidden = false;
    expect(cn("base", active && "active", hidden && "hidden")).toBe(
      "base active",
    );
  });

  it("resolves Tailwind padding conflicts — last class wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("resolves Tailwind text-color conflicts — last class wins", () => {
    expect(cn("text-red-500", "text-blue-700")).toBe("text-blue-700");
  });

  it("handles array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("strips empty strings from the output", () => {
    expect(cn("", "foo", "")).toBe("foo");
  });

  it("merges className strings that mix static and dynamic parts", () => {
    const variant = "outline";
    const size = "sm";
    expect(cn("btn", `btn-${variant}`, `btn-${size}`)).toBe(
      "btn btn-outline btn-sm",
    );
  });
});
