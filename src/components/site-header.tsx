import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocation } from "react-router";
import Cart from "./cart";
import { ModeToggle } from "./mode-toggle";
import Notifications from "./notifications";

const pathnames: Record<string, string> = {
  "/dashboard": "Análisis",
  "/expenses": "Expensas",
  "/customers": "Clientes",
  "/payments": "Pagos",
  "/suppliers": "Proveedores",
  "/purchases": "Compras",
  "/products": "Productos",
  "/sales": "Ventas",
  "/configuration": "Configuración",
};

export function SiteHeader() {
  const location = useLocation();

  const title = pathnames[location.pathname] || "Página";

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <h1 className="text-base font-medium">{title}</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Notifications />
          <Cart />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
