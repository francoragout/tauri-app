import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter, Routes, Route, Navigate } from "react-router";
import Dashboard from "./pages/dashboard";
import Products from "./pages/products";
import Sales from "./pages/sales";
import Customers from "./pages/customers";
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="sales" element={<Sales />} />
              <Route path="customers" element={<Customers />} />
            </Route>
          </Routes>
        </HashRouter>
        <Toaster />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
