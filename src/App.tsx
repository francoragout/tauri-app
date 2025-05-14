import { Card } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { NavLink, Outlet, useLocation } from "react-router";
import { Customer, CustomerSchema } from "./lib/zod";
import Database from "@tauri-apps/plugin-sql";
import Cart from "./components/cart";
import { SectionCards } from "./components/section-cards";

export async function GetCustomers(): Promise<Customer[]> {
  const db = await Database.load("sqlite:mydatabase.db");
  const result = await db.select("SELECT * FROM customers");
  return CustomerSchema.array().parse(result);
}

export default function App() {
  const location = useLocation();
  const currentTab = location.pathname.replace("/", "") || "dashboard";

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Card className="@container/main flex flex-1 flex-col gap-2 m-3">
        <Tabs value={currentTab} className="w-full px-6">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger asChild value="purchases" className="cursor-default">
                <NavLink to="/purchases">Compras</NavLink>
              </TabsTrigger>
              <TabsTrigger asChild value="products" className="cursor-default">
                <NavLink to="/products">Productos</NavLink>
              </TabsTrigger>
              <TabsTrigger asChild value="sales" className="cursor-default">
                <NavLink to="/sales">Ventas</NavLink>
              </TabsTrigger>
              <TabsTrigger asChild value="customers" className="cursor-default">
                <NavLink to="/customers">Clientes</NavLink>
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-4">
              <Cart />
              <ModeToggle />
            </div>
          </div>
          {/* <SectionCards /> */}
          <Outlet />
        </Tabs>
      </Card>
    </ThemeProvider>
  );
}
