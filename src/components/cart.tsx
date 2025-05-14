import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "./ui/button";
import { ListRestart, ShoppingCart } from "lucide-react";
import { Badge } from "./ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/features/cart/cartSlice";
import { SaleCreateForm } from "./sales/sale-create-form";
import { useState } from "react";
import { Separator } from "./ui/separator";
import { useQuery } from "@tanstack/react-query";
import { GetCustomers } from "@/lib/mutations/useCustomer";

export default function Cart() {
  const [openPopover, setOpenPopover] = useState(false);
  const [surcharge, setSurcharge] = useState(0);

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: GetCustomers,
  });

  const products = useSelector((state: RootState) => state.cart.items);
  const totalCount = products.reduce(
    (acc, product) => acc + product.quantity,
    0
  );
  const totalPrice = products.reduce(
    (acc, product) => acc + product.price * product.quantity,
    0
  );

  const dispatch = useDispatch();

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  const totalWithSurcharge = totalPrice + totalPrice * (surcharge / 100);

  return (
    <Popover
      open={openPopover}
      onOpenChange={(isOpen) => {
        setOpenPopover(isOpen);
        if (!isOpen) {
          setSurcharge(0);
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <ShoppingCart className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <ShoppingCart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
          <Badge className="absolute top-0 right-[-0.6rem] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
            <span>{totalCount}</span>
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-120">
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold mb-1">Registrar venta</div>

          <Button
            variant="ghost"
            size="icon"
            className="me-1"
            onClick={handleClearCart}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() =>
                            handleQuantityChange(
                              product.id!,
                              product.quantity - 1
                            )
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">
                          {product.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() =>
                            handleQuantityChange(
                              product.id!,
                              product.quantity + 1
                            )
                          }
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      $
                      {new Intl.NumberFormat("es-ES").format(
                        product.price * product.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell>
                    <Select
                      value={surcharge.toString()}
                      onValueChange={(value) => setSurcharge(Number(value))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3, 4, 5, 6].map((value) => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {" "}
                    ${new Intl.NumberFormat("es-ES").format(totalWithSurcharge)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <Separator className="my-4" />

            <SaleCreateForm
              products={products}
              customers={customers}
              onOpenChange={setOpenPopover}
              surcharge={surcharge}
              total={totalWithSurcharge}
              onResetSurcharge={() => setSurcharge(0)}
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
