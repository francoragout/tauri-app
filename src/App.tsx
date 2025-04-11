import { Card } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Products from "./pages/products";
import DashboardPage from "./pages/dashboard";
import { Button } from "./components/ui/button";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { Bell, ShoppingCart } from "lucide-react";
import { Badge } from "./components/ui/badge";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Card className="@container/main flex flex-1 flex-col gap-2 m-3">
        <Tabs defaultValue="dashboard" className="w-full px-6">
          <div className="flex justify-between">
            <TabsList>
              <TabsTrigger value="dashboard">Tablero</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="sales">Ventas</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" className="relative rounded-full">
                <ShoppingCart className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <ShoppingCart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
                <Badge className="absolute top-0 right-[-0.6rem] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
                  <span>3</span>
                </Badge>
              </Button>
              <Button variant="outline" size="icon" className="relative rounded-full">
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
          <TabsContent value="products">
            <Products />
          </TabsContent>
          <TabsContent value="dashboard">
            <DashboardPage />
          </TabsContent>
        </Tabs>
      </Card>
    </ThemeProvider>
  );
}
