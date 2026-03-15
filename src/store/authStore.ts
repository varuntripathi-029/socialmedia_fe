import { create } from 'zustand';
import type { User } from '@/types';
import { usersApi } from '@/api/users';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User) => void;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: sessionStorage.getItem('token'),
    isAuthenticated: !!sessionStorage.getItem('token'),
    isLoading: true,

    login: async (token: string) => {
        sessionStorage.setItem('token', token);
        set({ token, isAuthenticated: true });
        try {
            const response = await usersApi.getMe();
            set({ user: response.data, isLoading: false });
        } catch {
            set({ isLoading: false });
        }
    },

    logout: () => {
        sessionStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    setUser: (user: User) => set({ user }),

    initialize: async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }
        try {
            const response = await usersApi.getMe();
            set({ user: response.data, isAuthenticated: true, isLoading: false, token });
        } catch {
            sessionStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
