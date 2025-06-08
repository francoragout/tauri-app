import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";
import {
  CreateExpense,
  UpdateExpense,
  DeleteExpenses,
  GetExpenses,
} from "@/lib/mutations/useExpense";

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

describe("GetExpenses", () => {
  it("should fetch expenses from database", async () => {
    const mockData = [
      {
        id: 1,
        amount: 1000,
        date: "2025-06-01",
        local_date: "2025-05-31 21:00:00",
      },
      {
        id: 2,
        amount: 2500,
        date: "2025-06-02",
        local_date: "2025-06-01 21:00:00",
      },
    ];

    mockSelect.mockResolvedValueOnce(mockData);

    const result = await GetExpenses();

    expect(mockSelect).toHaveBeenCalledWith(
      `SELECT id, amount, date, datetime(date, '-3 hours') AS local_date FROM expenses`
    );

    expect(result).toEqual(mockData);
  });
});

describe("CreateExpense", () => {
  it("should insert expense and owners, then invalidate query", async () => {
    mockSelect.mockResolvedValueOnce([{ id: 101 }]); // last_insert_rowid()

    const { result } = renderHook(() => CreateExpense(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 0,
      category: "Comida",
      description: "Pizza",
      amount: 1200,
      owners: [
        { id: 1, name: "Franco", percentage: 60 },
        { id: 2, name: "Laura", percentage: 40 },
      ],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expenses"),
      ["Comida", "Pizza", 1200]
    );

    expect(mockSelect).toHaveBeenCalledWith(
      expect.stringContaining("SELECT last_insert_rowid()")
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [101, 1, 60]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [101, 2, 40]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
  });
});

describe("UpdateExpense", () => {
  it("should update expense, delete old owners, insert new owners, then invalidate query", async () => {
    const { result } = renderHook(() => UpdateExpense(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 5,
      category: "Transporte",
      description: "Uber",
      amount: 3000,
      owners: [{ id: 3, name: "Carlos", percentage: 100 }],
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE expenses"),
      ["Transporte", "Uber", 3000, 5]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM expense_owners"),
      [5]
    );

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO expense_owners"),
      [5, 3, 100]
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
  });
});

describe("DeleteExpenses", () => {
  it("should delete expenses and invalidate the query", async () => {
    const { result } = renderHook(() => DeleteExpenses(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([10, 11]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockExecute).toHaveBeenCalledWith(
      `DELETE FROM expenses WHERE id IN (10,11)`
    );

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["expenses"],
    });
  });
});
