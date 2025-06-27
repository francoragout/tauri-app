import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreateCustomer,
  UpdateCustomer,
  DeleteCustomers,
  GetCustomers,
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

describe("GetCustomers", () => {
  it("should fetch customers from database", async () => {
    const mockData = [
      { id: 1, name: "Customer 1", phone: "123456789" },
      { id: 2, name: "Customer 2", phone: "987654321" },
    ];

    mockSelect.mockResolvedValueOnce(mockData);

    const result = await GetCustomers();

    expect(mockSelect).toHaveBeenCalledWith("SELECT * FROM customers");
    expect(result).toEqual(mockData);
  });
});

describe("CreateCustomer", () => {
  it("should insert a new customer and invalidate the query", async () => {
    mockSelect.mockResolvedValueOnce([]); // No existing customer

    const { result } = renderHook(() => CreateCustomer(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Juan",
      phone: "123456789",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO customers"),
      ["Juan", "123456789"]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customers"],
    });
  });

  it("should throw an error if a customer with the same normalized name exists", async () => {
    // Simulate existing customer with normalized name
    mockSelect.mockResolvedValueOnce([{ id: 2 }]);

    const { result } = renderHook(() => CreateCustomer(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 3,
        name: "  JUAN  ",
        phone: "555555555",
      })
    ).rejects.toThrow("Ya existe un cliente con ese nombre");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("UpdateCustomer", () => {
  it("should update an existing customer and invalidate the query", async () => {
    // No existe otro cliente con el nombre normalizado (está libre para usar)
    mockSelect.mockResolvedValueOnce([]);

    const { result } = renderHook(() => UpdateCustomer(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Pedro",
      phone: "111222333",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE customers"),
      ["Pedro", "111222333", 1] // name, phone, id
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customers"],
    });
  });

  it("should throw an error if another customer with the same normalized name exists", async () => {
    // Existe otro cliente con ese nombre
    mockSelect.mockResolvedValueOnce([{ id: 2 }]);

    const { result } = renderHook(() => UpdateCustomer(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 1, // Estoy actualizando el cliente 1
        name: "  PEDRO  ", // Pero ya existe el cliente 2 con ese nombre
        phone: "999888777",
      })
    ).rejects.toThrow("Ya existe un cliente con ese nombre");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("DeleteCustomers", () => {
  it("should delete customers with no unpaid sales and invalidate the query", async () => {
    // Simulamos que los clientes no tienen deudas (ventas impagas = 0)
    mockSelect.mockResolvedValueOnce([{ count: 0 }, { count: 0 }]);

    const { result } = renderHook(() => DeleteCustomers(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([1, 2]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT COUNT(*) as count FROM sales"),
      [1, 2]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM customers"),
      [1, 2]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customers"],
    });
  });

  it("should throw an error if any selected customer has unpaid sales", async () => {
    // Simulamos que al menos uno tiene deuda
    mockSelect.mockResolvedValueOnce([
      { count: 0 },
      { count: 2 }, // Cliente con 2 ventas impagas
    ]);

    const { result } = renderHook(() => DeleteCustomers(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync([1, 2])).rejects.toThrow(
      "No se puede eliminar un cliente con deudas"
    );

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT COUNT(*) as count FROM sales"),
      [1, 2]
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
