import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DeleteAssetDialog from "@/app/(app)/dashboard/widgets/delete-asset-dialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  assetId: "asset-abc-123",
  assetName: "MacBook Pro 14″",
  onDeleted: vi.fn(),
};

function renderDialog(props = {}) {
  return render(<DeleteAssetDialog {...defaultProps} {...props} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DeleteAssetDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the dialog title when open", () => {
    renderDialog();
    expect(screen.getByText("Delete asset")).toBeInTheDocument();
  });

  it("shows the asset name in the warning text", () => {
    renderDialog();
    expect(screen.getByText(/MacBook Pro 14″/)).toBeInTheDocument();
  });

  it("has the Delete button disabled before any text is entered", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("keeps Delete button disabled when only a partial word is typed", async () => {
    const user = userEvent.setup();
    renderDialog();
    // "DELET" (missing last letter) must not unlock the button
    await user.type(screen.getByPlaceholderText("DELETE"), "DELET");
    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
  });

  it("accepts lowercase 'delete' (the comparison is case-insensitive)", async () => {
    const user = userEvent.setup();
    renderDialog();
    // The dialog uses .toUpperCase() so lowercase is valid
    await user.type(screen.getByPlaceholderText("DELETE"), "delete");
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("enables Delete button when 'DELETE' is typed exactly (case-sensitive)", async () => {
    const user = userEvent.setup();
    renderDialog();
    await user.type(screen.getByPlaceholderText("DELETE"), "DELETE");
    expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
  });

  it("calls fetch and onDeleted when the Delete button is clicked after confirmation", async () => {
    const user = userEvent.setup();

    // Mock a successful DELETE response
    const fetchSpy = vi
      .spyOn(global, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "asset-abc-123" }), { status: 200 }),
      );

    renderDialog();
    await user.type(screen.getByPlaceholderText("DELETE"), "DELETE");
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/assets/asset-abc-123",
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(defaultProps.onDeleted).toHaveBeenCalledWith("asset-abc-123");
    });
  });

  it("shows an error message when the API call fails", async () => {
    const user = userEvent.setup();

    vi.spyOn(global, "fetch").mockResolvedValueOnce(
      new Response("Not found", { status: 404, statusText: "Not Found" }),
    );

    renderDialog();
    await user.type(screen.getByPlaceholderText("DELETE"), "DELETE");
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(screen.getByText(/404/)).toBeInTheDocument();
    });
  });

  it("resets confirmation text when the dialog is closed and re-opened", async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog();

    await user.type(screen.getByPlaceholderText("DELETE"), "DEL");

    // Close the dialog
    rerender(<DeleteAssetDialog {...defaultProps} open={false} />);
    // Reopen
    rerender(<DeleteAssetDialog {...defaultProps} open={true} />);

    expect(screen.getByPlaceholderText("DELETE")).toHaveValue("");
  });
});
