import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreateCustomer,
  UpdateCustomer,
  DeleteCustomers,
} from "@/lib/mutations/useCustomer";

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

describe("CreateCustomer", () => {
  it("should insert a new customer and invalidate the query", async () => {
    const { result } = renderHook(() => CreateCustomer(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Juan",
      reference: "Ref123",
      phone: "123456789",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO customers"),
      ["Juan", "Ref123", "123456789"]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customers"],
    });
  });
});

describe("UpdateCustomer", () => {
  it("should update a customer and invalidate the query", async () => {
    const { result } = renderHook(() => UpdateCustomer(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Pedro",
      reference: "Ref999",
      phone: "987654321",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE customers SET"),
      ["Pedro", "Ref999", "987654321", 1]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customers"],
    });
  });
});

describe("DeleteCustomers", () => {
  it("should delete customers if they have no debts", async () => {
    mockSelect.mockResolvedValueOnce([{ count: 0 }]);

    const { result } = renderHook(() => DeleteCustomers(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [1, 2];

    await result.current.mutateAsync(idsToDelete);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT COUNT(*)")
    );

    expect(mockExecute).toHaveBeenCalledWith(
      `DELETE FROM customers WHERE id IN (${idsToDelete.join(",")})`
    );
    
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customers"],
    });
  });

  it("should throw if any customer has unpaid sales", async () => {
    mockSelect.mockResolvedValueOnce([{ count: 2 }]);

    const { result } = renderHook(() => DeleteCustomers(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync([1])).rejects.toThrow(
      "No se puede eliminar un cliente con deudas"
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
