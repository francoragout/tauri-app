import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreateOwner,
  UpdateOwner,
  DeleteOwners,
  GetOwners,
} from "@/lib/mutations/useOwner";

const mockExecute = vi.fn();
const mockSelect = vi.fn();
const mockInvalidateQueries = vi.fn();

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

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  };
});

beforeEach(() => {
  mockExecute.mockReset();
  mockSelect.mockReset();
  mockInvalidateQueries.mockReset();
});

describe("GetOwners", () => {
  it("should fetch owners from database", async () => {
    const mockData = [
      { id: 1, name: "Owner 1" },
      { id: 2, name: "Owner 2" },
    ];

    mockSelect.mockResolvedValueOnce(mockData);

    const result = await GetOwners();

    expect(mockSelect).toHaveBeenCalledWith("SELECT * FROM owners");
    expect(result).toEqual(mockData);
  });
});

describe("CreateOwner", () => {
  it("should insert a new owner and invalidate the query", async () => {
    const { result } = renderHook(() => CreateOwner(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 0,
      name: "New Owner",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO owners"),
      ["New Owner"]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });
  });
});

describe("UpdateOwner", () => {
  it("should update an existing owner and invalidate the query", async () => {
    const { result } = renderHook(() => UpdateOwner(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Updated Owner",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE owners"),
      ["Updated Owner", 1]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });
  });
});

describe("DeleteOwners", () => {
  it("should delete owners if they have no expenses", async () => {
    mockSelect.mockResolvedValueOnce([{ count: 0 }]); // No expenses

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [1, 2];

    await result.current.mutateAsync(idsToDelete);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining(
        `DELETE FROM customers WHERE id IN (${idsToDelete.join(",")})`
      ),
      [1, 2]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });

    it("should throw if any owner has expenses", async () => {
      mockSelect.mockResolvedValueOnce([{ count: 2 }]);

      const { result } = renderHook(() => DeleteOwners(), {
        wrapper: createWrapper(),
      });

      await expect(result.current.mutateAsync([1])).rejects.toThrow(
        "No se puede eliminar un propietario con expensas asociadas"
      );

      expect(mockExecute).not.toHaveBeenCalled();
      expect(mockInvalidateQueries).not.toHaveBeenCalled();
    });
  });

  it("should delete owners if they have no products", async () => {
    mockSelect.mockResolvedValueOnce([{ count: 0 }]);

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [1, 2];

    await result.current.mutateAsync(idsToDelete);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining(
        `DELETE FROM products WHERE id IN (${idsToDelete.join(",")})`
      ),
      [1, 2]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });
  });

  it("should throw if any owner has expenses", async () => {
    mockSelect.mockResolvedValueOnce([{ count: 2 }]);

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync([1])).rejects.toThrow(
      "No se puede eliminar un propietario con productos asociados"
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
