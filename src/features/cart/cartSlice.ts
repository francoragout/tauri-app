import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: number | undefined;
  name: string;
  price: number;
  quantity: number;
  originalPrice: number;
}

export interface CartState {
  products: CartItem[];
  surcharge: number; // Agregar el recargo al estado global
}

const initialState: CartState = {
  products: [],
  surcharge: 0, // Inicializar el recargo en 0
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const product = state.products.find((p) => p.id === action.payload.id);
      const currentSurcharge = state.surcharge || 0; // Obtener el recargo actual (debes agregarlo al estado global)
      if (product) {
        product.quantity += action.payload.quantity;
      } else {
        state.products.push({
          ...action.payload,
          originalPrice: action.payload.price, // Guardar el precio original
          price:
            action.payload.price +
            (action.payload.price * currentSurcharge) / 100, // Aplicar recargo
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      // Cambié 'string' a 'number'
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }> // Cambié 'string' a 'number'
    ) => {
      const product = state.products.find((p) => p.id === action.payload.id);
      if (product) {
        product.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.products = [];
      state.surcharge = 0; // Reiniciar el recargo al limpiar el carrito
    },
    applySurcharge: (state, action: PayloadAction<number>) => {
      const surchargePercentage = action.payload;
      state.surcharge = surchargePercentage; // Guardar el recargo actual
      state.products = state.products.map((product) => ({
        ...product,
        price:
          product.originalPrice +
          (product.originalPrice * surchargePercentage) / 100, // Usar originalPrice como base
      }));
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  applySurcharge,
} = cartSlice.actions;

export default cartSlice.reducer;
