import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  ChartNoAxesCombined,
  Cog,
  DollarSign,
  NotepadText,
  Power,
  Truck,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { GetSales } from "@/lib/mutations/useSale";
import { useQuery } from "@tanstack/react-query";
import { Sale } from "@/lib/zod";

const data = {
  store: [
    {
      name: "Analisis",
      url: "/dashboard",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Expensas",
      url: "/expenses",
      icon: BanknoteArrowDown,
    },
    {
      name: "Clientes",
      url: "/customers",
      icon: Users,
    },
    {
      name: "Pagos",
      url: "/payments",
      icon: BanknoteArrowUp,
    },
  ],
  inventory: [
    {
      name: "Proveedores",
      url: "/suppliers",
      icon: Truck,
    },
    {
      name: "Compras",
      url: "/purchases",
      icon: BanknoteArrowDown,
    },
    {
      name: "Productos",
      url: "/products",
      icon: NotepadText,
    },
    {
      name: "Ventas",
      url: "/sales",
      icon: BanknoteArrowUp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  const { data: sales = [] } = useQuery<Sale[]>({
    queryKey: ["today_sales"],
    queryFn: GetSales,
  });

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const today = new Date();
  const todayStr =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  // Sumar los totales de las ventas del día actual
  const todaySalesTotal = sales
    .filter((sale: Sale) => sale.local_date?.slice(0, 10) === todayStr)
    .reduce((sum: number, sale: Sale) => sum + (sale.total || 0), 0);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              Hoy
              <DollarSign />
              <span>
                {new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(todaySalesTotal)}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Negocio</SidebarGroupLabel>
          <SidebarMenu>
            {data.store.map((s) => (
              <SidebarMenuItem key={s.name}>
                <SidebarMenuButton
                  asChild
                  className={location.pathname === s.url ? "bg-accent" : ""}
                >
                  <NavLink to={s.url}>
                    <s.icon />
                    <span>{s.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Inventario</SidebarGroupLabel>
          <SidebarMenu>
            {data.inventory.map((i) => (
              <SidebarMenuItem key={i.name}>
                <SidebarMenuButton
                  asChild
                  className={location.pathname === i.url ? "bg-accent" : ""}
                >
                  <NavLink to={i.url}>
                    <i.icon />
                    <span>{i.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="group-data-[collapsible=icon]:hidden mt-auto">
          <SidebarMenu>
            <SidebarMenuItem className="active">
              <SidebarMenuButton asChild className="">
                <NavLink to="/configuration">
                  <Cog />
                  <span>Configuración</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Power className="!size-5" />
      </SidebarFooter>
    </Sidebar>
  );
}
