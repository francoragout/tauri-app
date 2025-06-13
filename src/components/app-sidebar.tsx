import * as React from "react";
import {
  Sidebar,
  SidebarContent,
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
  Landmark,
  ShoppingBasket,
  Truck,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { GetBalance } from "@/lib/mutations/useBalance";

const data = {
  store: [
    {
      name: "Analisis",
      url: "/dashboard",
      icon: ChartNoAxesCombined,
    },
    {
      name: "Propietarios",
      url: "/owners",
      icon: Users,
    },
    {
      name: "Gastos",
      url: "/expenses",
      icon: BanknoteArrowDown,
    },
    {
      name: "Clientes",
      url: "/customers",
      icon: Users,
    },
    {
      name: "Cuentas",
      url: "/bills",
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
      icon: ShoppingBasket,
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

  const { data: balance = 0 } = useQuery<number>({
    queryKey: ["balance"],
    queryFn: GetBalance,
  });

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton className="bg-accent text-accent-foreground">
              <Landmark />
              <span>
                ${" "}
                {new Intl.NumberFormat("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(balance)}
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
                  className={clsx(
                    "cursor-default",
                    location.pathname === s.url ? "bg-accent" : ""
                  )}
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
                  className={clsx(
                    "cursor-default",
                    location.pathname === i.url ? "bg-accent" : ""
                  )}
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
      </SidebarContent>
    </Sidebar>
  );
}
