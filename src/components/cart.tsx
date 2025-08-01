import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ListRestart, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { RootState } from "@/store";
import { clearCart } from "@/features/cart/cartSlice";
import { useMemo, useState } from "react";
import CartTable from "./cart-table";
import { SaleForm } from "./sales/sale-form";

export default function Cart() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [surcharge, setSurcharge] = useState(0);

  const products = useSelector((state: RootState) => state.cart.items);

  const totalCount = useMemo(() => {
    return products.reduce((acc, product) => acc + product.quantity, 0);
  }, [products]);

  const totalPrice = useMemo(() => {
    return products.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
  }, [products]);

  const totalWithSurcharge = useMemo(() => {
    return totalPrice + totalPrice * (surcharge / 100);
  }, [totalPrice, surcharge]);

  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <Popover open={isCreateOpen} onOpenChange={setIsCreateOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 p-0">
          <ShoppingCart className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <ShoppingCart className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Abrir carrito de compras</span>
          <Badge className="absolute top-0 right-[-8.5px] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
            <span>{totalCount}</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[500px]">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold mb-1">Registrar venta</div>
          <Button
            variant="ghost"
            size="sm"
            className="me-1"
            onClick={handleClearCart}
            disabled={products.length === 0}
          >
            <ListRestart />
          </Button>
        </div>
        {products.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tu carrito está vacío.
          </div>
        ) : (
          <>
            <CartTable totalWithSurcharge={totalWithSurcharge} />
            <SaleForm
              products={products}
              total={totalWithSurcharge}
              onOpenChange={setIsCreateOpen}
              onSurchargeChange={setSurcharge}
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
