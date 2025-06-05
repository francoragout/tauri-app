import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreateSupplier,
  UpdateSupplier,
  DeleteSuppliers,
} from "@/lib/mutations/useSupplier";

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

describe("CreateSupplier", () => {
  it("debería insertar un proveedor nuevo y luego invalidar la query", async () => {
    mockSelect.mockResolvedValueOnce([]); // No hay proveedor con ese nombre

    const { result } = renderHook(() => CreateSupplier(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 0,
      name: "Proveedor Test",
      phone: "123456",
      address: "Calle Falsa 123",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verifica que se haya ejecutado un INSERT
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT"),
      expect.any(Array)
    );
  });

  it("debería lanzar error si el proveedor ya existe (incluso con espacios)", async () => {
    mockSelect.mockResolvedValueOnce([{ id: 99 }]); // Ya existe

    const { result } = renderHook(() => CreateSupplier(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 0,
        name: " Proveedor Test ",
        phone: "000000",
        address: "Repetido",
      })
    ).rejects.toThrow("Ya existe un proveedor con ese nombre.");
  });

  it("debería lanzar un error si la inserción falla por un error interno", async () => {
    mockSelect.mockResolvedValueOnce([]); // No hay duplicados
    mockExecute.mockRejectedValueOnce(new Error("Fallo interno"));

    const { result } = renderHook(() => CreateSupplier(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 0,
        name: "Proveedor Error",
        phone: "123",
        address: "Error St",
      })
    ).rejects.toThrow("Fallo interno");

    // También podés verificar que se intentó ejecutar algo
    expect(mockExecute).toHaveBeenCalled();
  });
});

describe("UpdateSupplier", () => {
  it("debería actualizar un proveedor si el nombre es único", async () => {
    mockSelect.mockResolvedValueOnce([]); // No hay duplicado
    mockExecute.mockResolvedValueOnce(true);

    const { result } = renderHook(() => UpdateSupplier(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Proveedor Actualizado",
      phone: "123456",
      address: "Calle Nueva",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE"),
      expect.any(Array)
    );
  });

  it("debería lanzar error si el nombre ya está en uso por otro proveedor", async () => {
    mockSelect.mockResolvedValueOnce([{ id: 99 }]); // Nombre duplicado

    const { result } = renderHook(() => UpdateSupplier(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 1,
        name: " Proveedor Duplicado ",
        phone: "000000",
        address: "Ya existe",
      })
    ).rejects.toThrow("Ya existe un proveedor con ese nombre.");
  });

  it("debería lanzar error si la actualización falla", async () => {
    mockSelect.mockResolvedValueOnce([]); // No hay duplicado
    mockExecute.mockRejectedValueOnce(new Error("Fallo al actualizar"));

    const { result } = renderHook(() => UpdateSupplier(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 2,
        name: "Proveedor con error",
        phone: "123",
        address: "Error St",
      })
    ).rejects.toThrow("Fallo al actualizar");

    expect(mockExecute).toHaveBeenCalled();
  });
});

describe("DeleteSuppliers", () => {
  it("debería eliminar proveedores por sus ids y luego invalidar la query", async () => {
    mockExecute.mockResolvedValueOnce(true);

    const { result } = renderHook(() => DeleteSuppliers(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [1, 2, 3];

    await result.current.mutateAsync(idsToDelete);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      `DELETE FROM suppliers WHERE id IN (${idsToDelete.join(",")})`
    );
  });

  it("debería lanzar error si falla la eliminación", async () => {
    mockExecute.mockRejectedValueOnce(new Error("Error al eliminar"));

    const { result } = renderHook(() => DeleteSuppliers(), {
      wrapper: createWrapper(),
    });

    const idsToDelete = [4, 5];

    await expect(result.current.mutateAsync(idsToDelete)).rejects.toThrow(
      "Error al eliminar"
    );

    expect(mockExecute).toHaveBeenCalled();
  });
});
