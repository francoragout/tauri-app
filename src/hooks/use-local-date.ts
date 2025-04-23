import { useMemo } from "react";

export const useLocalDate = (dateString: string | Date) => {
  return useMemo(() => {
    const date = new Date(dateString);
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  }, [dateString]);
};
