import { create } from 'zustand';
import { IUser } from '@/types/user';

interface AuthState {
  isAuthenticated: boolean;
  user: IUser | null;
  setUser: (user: IUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ isAuthenticated: true, user }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
