import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function Notifications() {
  return (
    <Button variant="ghost" className="relative h-8 w-8 p-0">
      <Bell className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Bell className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
      <Badge className="absolute top-0 right-[-0.6rem] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
        <span>0</span>
      </Badge>
    </Button>
  );
}
