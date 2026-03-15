import api from './axios';
import type { User, ApiResponse } from '@/types';

export const followsApi = {
    followUser: (userId: number) =>
        api.post<ApiResponse>(`/follows/${userId}`),

    unfollowUser: (userId: number) =>
        api.delete<ApiResponse>(`/follows/${userId}`),

    requestFollow: (userId: number) =>
        api.post<ApiResponse>(`/follows/request/${userId}`),

    acceptRequest: (requestId: number) =>
        api.post<ApiResponse>(`/follows/accept/${requestId}`),

    rejectRequest: (requestId: number) =>
        api.post<ApiResponse>(`/follows/reject/${requestId}`),

    getFollowers: (userId: number) =>
        api.get<User[]>(`/follows/${userId}/followers`),

    getFollowing: (userId: number) =>
        api.get<User[]>(`/follows/${userId}/following`),
};
