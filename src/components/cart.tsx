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
import { Button } from "./ui/button";
import { ListRestart, ShoppingCart } from "lucide-react";
import { Badge } from "./ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  applySurcharge,
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/features/cart/cartSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Customer } from "@/lib/zod";
import { SaleCreateForm } from "./sales/sale-create-form";
import { useEffect, useState } from "react";

export default function Cart({ customers }: { customers: Customer[] }) {
  const [openPopover, setOpenPopover] = useState(false);
  const [surcharge, setSurcharge] = useState(0);
  const products = useSelector((state: RootState) => state.cart.products);
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

  const handleSurchargeChange = (surcharge: number) => {
    dispatch(applySurcharge(surcharge));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  useEffect(() => {
    if (products.length === 0) {
      setSurcharge(0);
    }
  }, [products]);

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
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
          Carrito de ventas
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
                      ${product.price * product.quantity}
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
                      onValueChange={(value) => {
                        const numericValue = Number(value);
                        setSurcharge(numericValue);
                        handleSurchargeChange(numericValue);
                      }}
                    >
                      <SelectTrigger size="sm" className="bg-background">
                        <SelectValue>{surcharge}%</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"0"}>0%</SelectItem>
                        <SelectItem value={"1"}>1%</SelectItem>
                        <SelectItem value={"2"}>2%</SelectItem>
                        <SelectItem value={"3"}>3%</SelectItem>
                        <SelectItem value={"4"}>4%</SelectItem>
                        <SelectItem value={"5"}>5%</SelectItem>
                        <SelectItem value={"6"}>6%</SelectItem>
                        <SelectItem value={"7"}>7%</SelectItem>
                        <SelectItem value={"8"}>8%</SelectItem>
                        <SelectItem value={"9"}>9%</SelectItem>
                        <SelectItem value={"10"}>10%</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">${totalPrice}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <SaleCreateForm
              products={products}
              customers={customers}
              onOpenChange={setOpenPopover}
              surcharge={surcharge}
              totalPrice={totalPrice}
            />
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
