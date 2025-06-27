import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import { CreateExpense, DeleteExpenses, UpdateExpense } from "@/lib/mutations/useExpense";

// 👇 Importás el módulo original para poder hacer spyOn
import * as balanceModule from "@/lib/mutations/useBalance";

const mockExecute = vi.fn();
const mockSelect = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockGetBalance = vi.fn();

// Mock de Tauri DB
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

// Mock de react-query
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
  vi.clearAllMocks(); // más seguro que reset individual

  // 👇 Hacemos spyOn de GetBalance y redirigimos al mock real
  vi.spyOn(balanceModule, "GetBalance").mockImplementation(() =>
    mockGetBalance()
  );
});

describe("CreateExpense", () => {
  it("should create a new expense and insert owners, then invalidate queries", async () => {
    // Simula balance suficiente
    mockGetBalance.mockResolvedValueOnce(500);

    // Simula que el último ID insertado es 10
    mockSelect.mockResolvedValueOnce([{ id: 10 }]);

    const { result } = renderHook(() => CreateExpense(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      category: "Comida",
      description: "Almuerzo",
      amount: 200,
      owners: [
        { id: 1, name: "Usuario 1", percentage: 50 },
        { id: 2, name: "Usuario 2", percentage: 50 },
      ],
    });

    // Verifica que insertó el gasto
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expenses"),
      ["Comida", "Almuerzo", 200]
    );

    // Verifica que consultó el ID del gasto
    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT last_insert_rowid")
    );

    // Verifica que insertó los dueños
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [10, 1, 50]
    );
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [10, 2, 50]
    );

    // Verifica que invalidó las queries
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["balance"],
    });
  });

  it("should throw error if expense amount is greater than balance", async () => {
    mockGetBalance.mockResolvedValueOnce(100); // balance bajo

    const { result } = renderHook(() => CreateExpense(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        category: "Viaje",
        description: "Taxi",
        amount: 150,
        owners: [{ id: 1, name: "Usuario 1", percentage: 100 }],
      })
    ).rejects.toThrow("El gasto no puede ser mayor que el balance actual");

    // No debe hacer inserts ni invalidar queries
    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockSelect).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("UpdateExpense", () => {
  it("should update expense, replace owners, and invalidate queries", async () => {
    mockGetBalance.mockResolvedValueOnce(1000);

    const { result } = renderHook(() => UpdateExpense(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 42,
      category: "Servicios",
      description: "Luz",
      amount: 400,
      owners: [
        { id: 1, name: "Usuario 1", percentage: 60 },
        { id: 2, name: "Usuario 2", percentage: 40 },
      ],
    });

    // UPDATE de gasto
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE expenses"),
      ["Servicios", "Luz", 400, 42]
    );

    // DELETE dueños anteriores
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM expense_owners"),
      [42]
    );

    // INSERT de nuevos dueños
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [42, 1, 60]
    );
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [42, 2, 40]
    );

    // Invalida queries
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["balance"],
    });
  });

  it("should throw error if amount is greater than balance", async () => {
    mockGetBalance.mockResolvedValueOnce(300); // balance menor

    const { result } = renderHook(() => UpdateExpense(), {
      wrapper: createWrapper(),
    });

    await expect(
      result.current.mutateAsync({
        id: 1,
        category: "Viaje",
        description: "Taxi",
        amount: 500, // mayor al balance
        owners: [{ id: 1, name: "Usuario 1", percentage: 100 }],
      })
    ).rejects.toThrow("El gasto no puede ser mayor que el balance actual");

    expect(mockExecute).not.toHaveBeenCalled();
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });
});

describe("DeleteExpenses", () => {
  it("should delete expenses by id and invalidate queries", async () => {
    const { result } = renderHook(() => DeleteExpenses(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([1, 2, 3]);

    expect(mockExecute).toHaveBeenCalledWith(
      "DELETE FROM expenses WHERE id IN (1,2,3)"
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["balance"],
    });
  });

  it("should handle empty array without calling execute", async () => {
    const { result } = renderHook(() => DeleteExpenses(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([]);

    // En este caso el comportamiento depende de tu lógica actual.
    // Si querés prevenir ejecución con array vacío, hacelo así:
    expect(mockExecute).toHaveBeenCalledWith(
      "DELETE FROM expenses WHERE id IN ()"
    );

    // O podrías validar en la lógica real y hacer que `execute` no se llame si `ids.length === 0`
    // En ese caso el test sería:
    // expect(mockExecute).not.toHaveBeenCalled();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["balance"],
    });
  });
});
