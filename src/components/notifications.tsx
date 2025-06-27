import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  GetNotifications,
  useMarkNotificationsAsRead,
} from "@/lib/mutations/useNotification";
import { Bell, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import clsx from "clsx";
import { useMemo, useState } from "react";

export default function Notifications() {
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: GetNotifications,
  });
  const [isOpen, setIsOpen] = useState(false);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.is_read),
    [notifications]
  );

  const { mutate } = useMarkNotificationsAsRead();

  const handleMarkAllAsRead = () => {
    mutate();
  };

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) refetch();
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 p-0">
          <Bell className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Bell className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Abrir notificaciones</span>
          <Badge
            aria-label={`Tienes ${unreadNotifications.length} notificaciones sin leer`}
            className="absolute top-0 right-[-8.5px] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full"
          >
            <span>{unreadNotifications.length}</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[500px]">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold mb-1">Notificaciónes</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadNotifications.length === 0}
          >
            <Eye />
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link
                to={notification.link}
                key={notification.id}
                className="cursor-default"
              >
                <Alert
                  className={clsx(
                    "my-2 transition-all duration-300 ",
                    !notification.is_read
                      ? "bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground animate-pulse"
                      : "bg-background"
                  )}
                >
                  <AlertTitle className="flex justify-between items-center">
                    {notification.title}

                    <span className="">
                      {formatDistanceToNow(new Date(notification.local_date), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </AlertTitle>
                  <AlertDescription
                    className={clsx(
                      notification.is_read
                        ? "text-primary"
                        : "text-primary-foreground"
                    )}
                  >
                    {notification.message}
                  </AlertDescription>
                </Alert>
              </Link>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Sin notificaciones nuevas.
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
