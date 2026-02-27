import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import type React from "react";

// Minimal wrapper — extend with providers (Router, Theme, etc.) as needed
function AllProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
