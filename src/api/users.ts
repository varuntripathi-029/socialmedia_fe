import api from './axios';
import type { User, UserProfile, ApiResponse, ProfileContent } from '@/types';

export const usersApi = {
    getMe: () =>
        api.get<User>('/users/me'),

    getUserProfile: (username: string) =>
        api.get<UserProfile>(`/users/${username}`),

    updateProfile: (data: { username?: string; bio?: string; profileImageUrl?: string; isPrivate?: boolean }) =>
        api.put<ApiResponse>('/users/profile', data),

    getUserContent: (userId: number) =>
        api.get<ProfileContent[]>(`/users/${userId}/content`),

    searchUsers: (query: string) =>
        api.get<User[]>(`/users/search?username=${query}`),

    checkUsernameAvailability: (username: string) =>
        api.get<ApiResponse>(`/users/check-username/${username}`),
};
