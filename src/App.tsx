import { Card } from "./components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { Bell, ShoppingCart } from "lucide-react";
import { Badge } from "./components/ui/badge";
import { NavLink, Outlet, useLocation } from "react-router";

export default function App() {
  const location = useLocation();
  const currentTab = location.pathname.replace("/", "") || "dashboard";
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Card className="@container/main flex flex-1 flex-col gap-2 m-3">
        <Tabs value={currentTab} className="w-full px-6">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger asChild value="dashboard" className="cursor-default">
                <NavLink to="/dashboard">Tablero</NavLink>
              </TabsTrigger>
              <TabsTrigger asChild value="products" className="cursor-default">
                <NavLink to="/products">Productos</NavLink>
              </TabsTrigger>
              <TabsTrigger asChild value="sales" className="cursor-default">
                <NavLink to="/sales">Ventas</NavLink>
              </TabsTrigger>
              <TabsTrigger asChild value="clients" className="cursor-default">
                <NavLink to="/clients">Clientes</NavLink>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full"
              >
                <ShoppingCart className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <ShoppingCart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
                <Badge className="absolute top-0 right-[-0.6rem] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
                  <span>3</span>
                </Badge>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="relative rounded-full"
              >
                <Bell className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Bell className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
                <Badge className="absolute top-0 right-[-0.6rem] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
                  <span>3</span>
                </Badge>
              </Button>
              <ModeToggle />
            </div>
          </div>
          <Outlet />
        </Tabs>
      </Card>
    </ThemeProvider>
  );
}
