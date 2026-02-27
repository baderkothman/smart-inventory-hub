import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InventoryPieChart } from "@/app/(app)/home/analytics-charts";
import type { InventoryStat } from "@/app/(app)/home/analytics-charts";

const makeInv = (
  overrides: Partial<InventoryStat> & { assetCount: number },
): InventoryStat => ({
  id: "inv-1",
  name: "Office",
  isDefault: false,
  ...overrides,
});

describe("InventoryPieChart", () => {
  it("shows the empty state message when data array is empty", () => {
    render(<InventoryPieChart data={[]} />);
    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });

  it("shows the empty state when all inventories have 0 assets", () => {
    render(
      <InventoryPieChart
        data={[makeInv({ assetCount: 0 }), makeInv({ id: "inv-2", assetCount: 0 })]}
      />,
    );
    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });

  it("renders an SVG pie chart when there is at least one asset", () => {
    render(<InventoryPieChart data={[makeInv({ assetCount: 5 })]} />);
    expect(
      screen.getByLabelText("Items per inventory pie chart"),
    ).toBeInTheDocument();
  });

  it("renders inventory names in the legend", () => {
    render(
      <InventoryPieChart
        data={[
          makeInv({ id: "a", name: "Warehouse A", assetCount: 3 }),
          makeInv({ id: "b", name: "Office B", assetCount: 7 }),
        ]}
      />,
    );
    expect(screen.getByText("Warehouse A")).toBeInTheDocument();
    expect(screen.getByText("Office B")).toBeInTheDocument();
  });

  it("shows the '(default)' label for the default inventory", () => {
    render(
      <InventoryPieChart
        data={[makeInv({ isDefault: true, assetCount: 5 })]}
      />,
    );
    expect(screen.getByText("(default)")).toBeInTheDocument();
  });

  it("does NOT show the '(default)' label when isDefault is false", () => {
    render(
      <InventoryPieChart
        data={[makeInv({ isDefault: false, assetCount: 5 })]}
      />,
    );
    expect(screen.queryByText("(default)")).not.toBeInTheDocument();
  });

  it("renders the asset count number in the legend", () => {
    render(<InventoryPieChart data={[makeInv({ assetCount: 42 })]} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders percentage labels in the legend", () => {
    render(
      <InventoryPieChart
        data={[
          makeInv({ id: "a", assetCount: 1 }),
          makeInv({ id: "b", assetCount: 1 }),
        ]}
      />,
    );
    // 50% each
    const percentages = screen.getAllByText("50%");
    expect(percentages).toHaveLength(2);
  });
});
