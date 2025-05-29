import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";

export default function Notifications() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 p-0">
          <Bell className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Bell className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
          <Badge className="absolute top-0 right-[-8.5px] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
            <span>0</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-120">
        <ScrollArea className="h-96">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notificaciones</h3>
            <p className="text-sm text-muted-foreground">
              No tienes notificaciones nuevas.
            </p>
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
