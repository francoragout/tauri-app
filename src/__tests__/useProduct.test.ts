import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreateProduct,
  UpdateProduct,
  DeleteProducts,
  GetProducts,
} from "@/lib/mutations/useProduct";

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

describe("GetProducts", () => {
  it("should fetch products from database", async () => {
    const mockData = [
      {
        id: 1,
        name: "Product 1",
        category: "Category 1",
        price: 100,
        stock: 10,
      },
      {
        id: 2,
        name: "Product 2",
        category: "Category 2",
        price: 200,
        stock: 20,
      },
    ];

    mockSelect.mockResolvedValueOnce(mockData);

    const result = await GetProducts();

    expect(mockSelect).toHaveBeenCalledWith("SELECT * FROM products");
    expect(result).toEqual(mockData);
  });
});

describe("CreateProduct", () => {
  it("crea un producto y sus dueños correctamente si no existe", async () => {
    // 1. Simula que no existe el producto
    mockSelect
      .mockResolvedValueOnce([]) // Verificación de existencia
      .mockResolvedValueOnce([{ id: 99 }]); // last_insert_rowid

    const { result } = renderHook(() => CreateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "  Pan  ",
      category: "Alimentos",
      price: 120,
      stock: 30,
      owners: [
        { id: 1, name: "Owner 1", percentage: 70 },
        { id: 2, name: "Owner 2", percentage: 30 },
      ],
    });

    await waitFor(() => {
      // 2. Debe haber hecho 2 selects: check duplicado y obtener id
      expect(mockSelect).toHaveBeenCalledTimes(2);

      // 3. Debe haber hecho 3 executes: insert producto + 2 dueños
      expect(mockExecute).toHaveBeenCalledTimes(3);

      // Validar que los dueños fueron insertados con los datos correctos
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO product_owners"),
        [99, 1, 70]
      );
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO product_owners"),
        [99, 2, 30]
      );

      // 4. Debe invalidar queries de productos
      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["products"],
      });
    });
  });

  it("lanza error si el producto ya existe", async () => {
    mockSelect.mockResolvedValueOnce([{ id: 1 }]); // producto duplicado

    const { result } = renderHook(() => CreateProduct(), {
      wrapper: createWrapper(),
    });

    let error;
    try {
      await result.current.mutateAsync({
        name: "PAN", // ignora mayúsculas
        category: "Alimentos",
        price: 100,
        stock: 20,
        owners: [],
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect((error as Error).message).toBe(
      "Ya existe un producto con ese nombre"
    );

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("UpdateProduct", () => {
  it("actualiza un producto correctamente si el nombre no está duplicado", async () => {
    mockSelect.mockResolvedValueOnce([]); // no hay duplicado

    const { result } = renderHook(() => UpdateProduct(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      id: 42,
      name: "Nuevo Nombre",
      category: "Snacks",
      price: 50,
      stock: 100,
      owners: [
        { id: 1, name: "Owner 1", percentage: 60 },
        { id: 2, name: "Owner 2", percentage: 40 },
      ],
    });

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining("SELECT id FROM products"),
        ["nuevo nombre", 42]
      );

      // Ejecuta UPDATE
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE products"),
        ["Nuevo Nombre", "Snacks", 50, 100, 42]
      );

      // Ejecuta DELETE de dueños antiguos
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM product_owners"),
        [42]
      );

      // Inserta nuevos dueños
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO product_owners"),
        [42, 1, 60]
      );
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO product_owners"),
        [42, 2, 40]
      );

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["products"],
      });
    });
  });

  it("lanza error si se intenta actualizar a un nombre que ya existe en otro producto", async () => {
    mockSelect.mockResolvedValueOnce([{ id: 99 }]); // producto con ese nombre ya existe

    const { result } = renderHook(() => UpdateProduct(), {
      wrapper: createWrapper(),
    });

    let error;
    try {
      await result.current.mutateAsync({
        id: 42,
        name: "Repetido",
        category: "Limpieza",
        price: 30,
        stock: 10,
        owners: [],
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect((error as Error).message).toBe(
      "Ya existe un producto con ese nombre"
    );

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("DeleteProducts", () => {
  it("elimina productos si no tienen compras asociadas", async () => {
    mockSelect.mockResolvedValueOnce([]); // No hay compras asociadas

    const { result } = renderHook(() => DeleteProducts(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([1, 2, 3]);

    await waitFor(() => {
      expect(mockSelect).toHaveBeenCalledWith(
        expect.stringContaining("FROM purchases WHERE product_id IN"),
        [1, 2, 3]
      );

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM products WHERE id IN"),
        [1, 2, 3]
      );

      expect(mockInvalidateQueries).toHaveBeenCalledWith({
        queryKey: ["products"],
      });
    });
  });

  it("lanza error si algún producto tiene compras asociadas", async () => {
    mockSelect.mockResolvedValueOnce([{ product_id: 2 }]); // producto 2 tiene compras

    const { result } = renderHook(() => DeleteProducts(), {
      wrapper: createWrapper(),
    });

    let error;
    try {
      await result.current.mutateAsync([1, 2, 3]);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect((error as Error).message).toBe(
      "No se pueden eliminar productos con compras asociadas"
    );

    expect(mockSelect).toHaveBeenCalledTimes(1);
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
