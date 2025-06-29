import { create } from 'zustand';
import { IMessage, IUser } from '@/types/user';

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

type Callback = (data: IMessage) => void;

interface SocketListenersStore {
  listeners: Record<string, Set<Callback>>;

  addListener: (event: string, cb: Callback) => void;
  removeListener: (event: string, cb: Callback) => void;
  emitToListeners: (event: string, data: IMessage) => void;
}

export const useSocketListenersStore = create<SocketListenersStore>((set, get) => ({
  listeners: {},
  
  addListener: (event, cb) => {
    const current = get().listeners[event] ?? new Set<Callback>();
    current.add(cb);
    set((state) => ({
      listeners: { ...state.listeners, [event]: current },
    }));
  },

  removeListener: (event, cb) => {
    const current = get().listeners[event];
    if (current) {
      current.delete(cb);
      set((state) => ({
        listeners: { ...state.listeners, [event]: current },
      }));
    }
  },

  emitToListeners: (event, data) => {
    const current = get().listeners[event];
    if (current) {
      current.forEach((cb) => cb(data));
    }
  },
}));

type ChatStore = {
  chatIds: string[];
  addChatId: (id: string | string[]) => void;
  removeChatId: (id: string | string[]) => void;
  setChatIds: (ids: string[]) => void;
};

export const useChatStore = create<ChatStore>((set, get) => ({
  chatIds: [],

  addChatId: (id) => {
    const current = new Set(get().chatIds);
    const idsToAdd = Array.isArray(id) ? id : [id];
    idsToAdd.forEach((i) => current.add(i));
    set({ chatIds: Array.from(current) });
  },

  removeChatId: (id) => {
    const idsToRemove = new Set(Array.isArray(id) ? id : [id]);
    const updated = get().chatIds.filter((i) => !idsToRemove.has(i));
    set({ chatIds: updated });
  },

  setChatIds: (ids) => {
    set({ chatIds: Array.from(new Set(ids)) });
  },
}));