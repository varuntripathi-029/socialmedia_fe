import api from './axios';
import type { AuthResponse } from '@/types';

export const authApi = {
    login: (email: string, password: string) =>
        api.post<AuthResponse>('/auth/login', { usernameOrEmail: email, password }),

    signup: (data: { fullName: string; email: string; password: string; username?: string }) =>
        api.post<AuthResponse>('/auth/register', data),

    googleAuth: (idToken: string, username?: string) =>
        api.post<AuthResponse>('/auth/google', { idToken, username }),
};
