import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/features/cart/cartSlice";
import { CreateSale } from "@/lib/mutations/useSale";
import { toast } from "sonner";
import { useState } from "react";

const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
];

export default function Cart() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const items = useSelector((state: RootState) => state.cart.items);
  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
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

  const { mutate, isPending } = CreateSale();

  const handleConfirmPurchase = () => {
    const values = {
      total: totalPrice,
      items: items.map((item) => ({
        product_id: item.id!,
        quantity: item.quantity,
      })),
    };

    mutate(values, {
      onSuccess: () => {
        dispatch(clearCart());
        toast.success("Venta realizada exitosamente.");
      },
      onError: () => {
        toast.error("Error al realizar la venta.");
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <ShoppingCart className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <ShoppingCart className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
          <Badge className="absolute top-0 right-[-0.6rem] inline-flex items-center justify-center h-4 min-w-[1rem] px-1 text-xs font-bold leading-none rounded-full">
            <span>{totalCount}</span>
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-100">
        <div className="flex justify-between items-center">
          <DropdownMenuLabel>Carrito de compras</DropdownMenuLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="me-1"
                  onClick={handleClearCart}
                >
                  <ListRestart />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Limpiar carrito</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Tu carrito está vacío.
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-secondary">
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() =>
                            handleQuantityChange(item.id!, item.quantity - 1)
                          }
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() =>
                            handleQuantityChange(item.id!, item.quantity + 1)
                          }
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price * item.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>Total</TableCell>
                  <TableCell className="text-right">${totalPrice}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-2 gap-2 items-center mt-2 mb-1">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    size="sm"
                    aria-expanded={open}
                    className="justify-between"
                  >
                    {value
                      ? frameworks.find(
                          (framework) => framework.value === value
                        )?.label
                      : "Cliente (opcional)"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search framework..." />
                    <CommandList>
                      <CommandEmpty>No framework found.</CommandEmpty>
                      <CommandGroup>
                        {frameworks.map((framework) => (
                          <CommandItem
                            key={framework.value}
                            value={framework.value}
                            onSelect={(currentValue) => {
                              setValue(
                                currentValue === value ? "" : currentValue
                              );
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                value === framework.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {framework.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button
                size="sm"
                onClick={handleConfirmPurchase}
                disabled={isPending}
              >
                <span className="text-sm">Confirmar compra</span>
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
