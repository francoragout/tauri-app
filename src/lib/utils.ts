import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Función para combinar clases de Tailwind CSS y clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Función para combinar una fecha con la hora actual
export function combineDateWithCurrentTime(date: Date) {
  const now = new Date();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds()
  );
}

// Función para formatear la fecha a formato SQL
export function formatDateToSql(date: Date) {
  return date.toISOString().replace("T", " ").substring(0, 19);
}
