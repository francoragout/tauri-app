import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { removeFromCart, updateQuantity } from "@/features/cart/cartSlice";

export default function CartTable({
  totalWithSurcharge,
}: {
  totalWithSurcharge: number;
}) {
  const products = useSelector((state: RootState) => state.cart.items);

  const dispatch = useDispatch();

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity < 1) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateQuantity({ id, quantity }));
    }
  };

  return (
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
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() =>
                    handleQuantityChange(product.id!, product.quantity - 1)
                  }
                >
                  -
                </Button>
                <span className="w-8 text-center">{product.quantity}</span>
                <Button
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() =>
                    handleQuantityChange(product.id!, product.quantity + 1)
                  }
                >
                  +
                </Button>
              </div>
            </TableCell>
            <TableCell className="text-right">
              $
              {new Intl.NumberFormat("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(product.price * product.quantity)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">
            $
            {new Intl.NumberFormat("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalWithSurcharge)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
