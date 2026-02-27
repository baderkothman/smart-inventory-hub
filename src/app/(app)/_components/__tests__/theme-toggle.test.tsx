import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/app/(app)/_components/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    // Reset localStorage and dark class before each test
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders the Appearance heading", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("Appearance")).toBeInTheDocument();
  });

  it("shows 'Light mode is on' description when theme is light (default)", async () => {
    render(<ThemeToggle />);
    // useEffect runs after initial render — use findByText for async state update
    expect(await screen.findByText("Light mode is on")).toBeInTheDocument();
  });

  it("renders the toggle button with aria-label", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument();
  });

  it("toggles to dark mode when the button is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(await screen.findByText("Dark mode is on")).toBeInTheDocument();
  });

  it("persists the chosen theme to localStorage", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(localStorage.getItem("sih-theme")).toBe("dark");
  });

  it("reads an existing dark preference from localStorage on mount", async () => {
    localStorage.setItem("sih-theme", "dark");
    render(<ThemeToggle />);
    expect(await screen.findByText("Dark mode is on")).toBeInTheDocument();
  });

  it("toggles back to light mode from dark", async () => {
    const user = userEvent.setup();
    localStorage.setItem("sih-theme", "dark");
    render(<ThemeToggle />);
    // After mounting in dark mode, click to go back to light
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(await screen.findByText("Light mode is on")).toBeInTheDocument();
    expect(localStorage.getItem("sih-theme")).toBe("light");
  });
});
