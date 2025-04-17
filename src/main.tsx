import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import Products from "./pages/products";
import Sales from "./pages/sales";
import DashboardPage from "./pages/dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { store } from "./store";
import { Provider } from "react-redux";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<Products />} />
              <Route path="sales" element={<Sales />} />
            </Route>
          </Routes>
        </HashRouter>
        <Toaster />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
