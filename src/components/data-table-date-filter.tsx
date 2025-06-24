import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { useLocation } from "react-router";

const pathnames: Record<string, string> = {
  "/expenses": "gastos",
  "/purchases": "compras",
  "/sales": "ventas",
};

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
}

export function DataTableDateFilter({
  date,
  setDate,
}: DatePickerWithRangeProps) {
  const location = useLocation();

  const matchedPath = Object.keys(pathnames).find((key) =>
    location.pathname.startsWith(key)
  );

  const title = matchedPath ? pathnames[matchedPath] : "";

  return (
    <div className={cn("grid gap-2")}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "w-[150px] lg:w-[250px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "PP", { locale: es })} -{" "}
                  {format(date.to, "PP", { locale: es })}
                </>
              ) : (
                format(date.from, "PP", { locale: es })
              )
            ) : (
              <span>Filtrar {title}...</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
