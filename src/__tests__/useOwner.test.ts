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
    // No hay propietario duplicado
    mockSelect.mockResolvedValueOnce([]); // Simula que no hay coincidencias

    const { result } = renderHook(() => CreateOwner(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Carlos",
      alias: "C",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSelect).toHaveBeenCalledWith(
      `SELECT name FROM owners WHERE LOWER(TRIM(name)) = $1`,
      ["carlos"]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      `INSERT INTO owners (name, alias) VALUES ($1, $2)`,
      ["Carlos", "C"]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });
  });

  it("should throw an error if an owner with the same normalized name exists", async () => {
    // Simula que ya existe un propietario con ese nombre
    mockSelect.mockResolvedValueOnce([{ name: "Carlos" }]);

    const { result } = renderHook(() => CreateOwner(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 2,
        name: "  CARLOS  ",
        alias: "C2",
      })
    ).rejects.toThrow("Ya existe un propietario con ese nombre");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("UpdateOwner", () => {
  it("should update an existing owner and invalidate the query", async () => {
    // No hay otro propietario con el nombre normalizado (excluyendo el mismo)
    mockSelect.mockResolvedValueOnce([]);

    const { result } = renderHook(() => UpdateOwner(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      name: "Pedro",
      alias: "P",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSelect).toHaveBeenCalledWith(
      `SELECT id FROM owners WHERE LOWER(TRIM(name)) = $1 AND id != $2`,
      ["pedro", 1]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      `UPDATE owners SET name = $1, alias = $2 WHERE id = $3`,
      ["Pedro", "P", 1]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });
  });

  it("should throw an error if another owner with the same normalized name exists", async () => {
    // Simulamos que otro propietario con el mismo nombre existe
    mockSelect.mockResolvedValueOnce([{ id: 2 }]);

    const { result } = renderHook(() => UpdateOwner(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 1,
        name: "  PEDRO  ",
        alias: "P2",
      })
    ).rejects.toThrow("Ya existe un propietario con ese nombre");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("DeleteOwners", () => {
  it("should delete owners with no products or expenses and invalidate the query", async () => {
    mockSelect
      .mockResolvedValueOnce([{ count: 0 }]) // productCheck
      .mockResolvedValueOnce([{ count: 0 }]); // expenseCheck

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([1, 2]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT COUNT(*) as count FROM product_owners"),
      [1, 2]
    );
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT COUNT(*) as count FROM expense_owners"),
      [1, 2]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM owners WHERE id IN"),
      [1, 2]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["owners"],
    });
  });

  it("should throw an error if owners have products associated", async () => {
    mockSelect
      .mockResolvedValueOnce([{ count: 3 }]) // productCheck
      .mockResolvedValueOnce([{ count: 0 }]); // expenseCheck

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync([1, 2])).rejects.toThrow(
      "No se pueden eliminar propietarios con productos asociados"
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("should throw an error if owners have expenses associated", async () => {
    mockSelect
      .mockResolvedValueOnce([{ count: 0 }]) // productCheck
      .mockResolvedValueOnce([{ count: 5 }]); // expenseCheck

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync([1, 2])).rejects.toThrow(
      "No se pueden eliminar propietarios con gastos asociados"
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it("should throw an error if owners have both products and expenses associated", async () => {
    mockSelect
      .mockResolvedValueOnce([{ count: 2 }]) // productCheck
      .mockResolvedValueOnce([{ count: 4 }]); // expenseCheck

    const { result } = renderHook(() => DeleteOwners(), {
      wrapper: createWrapper(),
    });

    await expect(result.current.mutateAsync([1, 2])).rejects.toThrow(
      "No se pueden eliminar propietarios con productos o gastos asociados"
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});
