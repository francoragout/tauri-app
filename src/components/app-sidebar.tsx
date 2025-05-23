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
  Calculator,
  ChartNoAxesCombined,
  Cog,
  DollarSign,
  MailIcon,
  NotepadText,
  PlusCircleIcon,
  Power,
  ShoppingBasket,
  Users,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { Button } from "./ui/button";
import { GetSales } from "@/lib/mutations/useSale";
import { useQuery } from "@tanstack/react-query";

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
  ],
  inventory: [
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

  const { data: sales = [] } = useQuery({
    queryKey: ["sales"],
    queryFn: GetSales,
  });

  const today = new Date();
  const totalToday = sales
    .filter((sale: any) => {
      const saleDate = new Date(sale.date);
      return (
        saleDate.getDate() === today.getDate() &&
        saleDate.getMonth() === today.getMonth() &&
        saleDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((acc: number, sale: any) => acc + (sale.total || 0), 0);

    console.log("totalToday", totalToday);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          {/* <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ShoppingBasket className="!size-5" />
                <span className="text-base font-semibold">Store Master</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem className="flex items-center gap-2">
            {/* <Button
              size="icon"
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <Calculator />
              <span className="sr-only">Inbox</span>
            </Button> */}
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <DollarSign />
              <span>22.570</span>
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
