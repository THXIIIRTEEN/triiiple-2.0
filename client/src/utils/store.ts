import { create } from 'zustand';
import { IUser } from '@/types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  setUser: (user: IUser) => void;
  logout: () => void;
  updateUserField: (key: string, value: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ isAuthenticated: true, user }),
  updateUserField: (key, value) =>
    set((state) => ({
      user: {
        ...state.user,
        [key]: value,
      },
    })),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
