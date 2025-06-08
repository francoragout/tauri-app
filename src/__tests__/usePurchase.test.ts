import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreatePurchase,
  DeletePurchases,
  UpdatePurchase,
} from "@/lib/mutations/usePurchase";

const mockExecute = vi.fn(async () => true);
const mockSelect = vi.fn();

vi.mock("@tauri-apps/plugin-sql", () => {
  return {
    default: {
      load: vi.fn(async () => ({
        select: mockSelect,
        execute: mockExecute,
      })),
    },
  };
});

beforeEach(() => {
  mockSelect.mockReset();
  mockExecute.mockReset();
});

describe("CreatePurchase", () => {
  it("should insert a new purchase and then invalidate the query", async () => {
    mockSelect.mockResolvedValueOnce([]); // No existing purchases

    const { result } = renderHook(() => CreatePurchase(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 0,
      product_id: 1,
      supplier_id: 1,
      quantity: 10,
      total: 100,
      payment_method: "cash",
      local_date: new Date().toISOString(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify that the purchase was inserted
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT"),
      expect.any(Array)
    );
  });

  it("should throw an error if insertion fails due to internal error", async () => {
    mockSelect.mockResolvedValueOnce([]); // No duplicates
    mockExecute.mockRejectedValueOnce(new Error("Internal failure"));

    const { result } = renderHook(() => CreatePurchase(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 0,
        product_id: 1,
        supplier_id: 1,
        quantity: 10,
        total: 100,
        payment_method: "cash",
        local_date: new Date().toISOString(),
      })
    ).rejects.toThrow("Internal failure");

    // You can also verify that something was attempted to execute
    expect(mockExecute).toHaveBeenCalled();
  });
});

describe("UpdatePurchase", () => {
  it("should update an existing purchase and invalidate the query", async () => {
    const { result } = renderHook(() => UpdatePurchase(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      product_id: 2,
      supplier_id: 2,
      quantity: 5,
      total: 50,
      payment_method: "credit",
      local_date: new Date().toISOString(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify that the purchase was updated
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE"),
      expect.any(Array)
    );
  });

  it("should throw an error if update fails", async () => {
    mockSelect.mockResolvedValueOnce([]); // No duplicate
    mockExecute.mockRejectedValueOnce(new Error("Update failed"));

    const { result } = renderHook(() => UpdatePurchase(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 1,
        product_id: 2,
        supplier_id: 2,
        quantity: 5,
        total: 50,
        payment_method: "credit",
        local_date: new Date().toISOString(),
      })
    ).rejects.toThrow("Update failed");

    expect(mockExecute).toHaveBeenCalled();
  });
});

describe("DeletePurchases", () => {
  it("should delete multiple purchases by IDs and invalidate the query", async () => {
    mockExecute.mockResolvedValueOnce(true);

    const { result } = renderHook(() => DeletePurchases(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [1, 2, 3];

    await result.current.mutateAsync(idsToDelete);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      `DELETE FROM purchases WHERE id IN (${idsToDelete.join(",")})`
    );
  });

  it("should throw an error if deletion fails", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Delete error"));

    const { result } = renderHook(() => DeletePurchases(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [4, 5];

    await expect(result.current.mutateAsync(idsToDelete)).rejects.toThrow(
      "Delete error"
    );

    expect(mockExecute).toHaveBeenCalled();
  });
});
