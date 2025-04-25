import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  id: number | undefined
  name: string
  price: number
  quantity: number
}

export interface CartState {
  products: CartItem[]
}

const initialState: CartState = {
  products: [],
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const product = state.products.find(p => p.id === action.payload.id)
      if (product) {
        product.quantity += action.payload.quantity
      } else {
        state.products.push(action.payload)
      }
    },
    removeFromCart: (state, action: PayloadAction<number>) => {  // Cambié 'string' a 'number'
      state.products = state.products.filter(p => p.id !== action.payload)
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>  // Cambié 'string' a 'number'
    ) => {
      const product = state.products.find(p => p.id === action.payload.id)
      if (product) {
        product.quantity = action.payload.quantity
      }
    },
    clearCart: (state) => {
      state.products = []
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions

export default cartSlice.reducer
