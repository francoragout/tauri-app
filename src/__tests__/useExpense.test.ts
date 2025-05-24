import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { createWrapper } from "./utils/reactQueryWrapper";

import {
  CreateExpense,
  DeleteExpenses,
  UpdateExpense,
} from "@/lib/mutations/useExpense";

vi.mock("@tauri-apps/plugin-sql", () => {
  return {
    default: {
      load: vi.fn(async () => ({
        execute: vi.fn(async () => Promise.resolve(true)),
      })),
    },
  };
});

describe("CreateExpense", () => {
  it("debería insertar y luego invalidar la query", async () => {
    const { result } = renderHook(() => CreateExpense(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      category: "Test",
      amount: 100,
      description: "desc",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("UpdateExpense", () => {
  it("debería actualizar y luego invalidar la query", async () => {
    const { result } = renderHook(() => UpdateExpense(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      id: 1,
      category: "Test",
      amount: 100,
      description: "desc",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("DeleteExpenses", () => {
  it("debería eliminar varios ids y luego invalidar la query", async () => {
    const { result } = renderHook(() => DeleteExpenses(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync([1, 2, 3]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
