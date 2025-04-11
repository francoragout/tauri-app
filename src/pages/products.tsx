// src/pages/products.tsx
import '../App.css';
import { useQuery } from "@tanstack/react-query";
import { getAllProducts } from "@/lib/db";
import { ProductsColumns } from "@/components/products/products-columns";
import { ProductsTable } from "@/components/products/products-table";

export default function Products() {
  const { data = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getAllProducts,
  });

  return <ProductsTable data={data} columns={ProductsColumns} />;
}
