import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Book, Inventory } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
        }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, isAdmin: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartItem {
  book: Book;
  inventory: Inventory;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (inventoryId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.inventory.id === item.inventory.id)) {
            return state;
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (inventoryId) =>
        set((state) => ({
          items: state.items.filter((i) => i.inventory.id !== inventoryId),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
