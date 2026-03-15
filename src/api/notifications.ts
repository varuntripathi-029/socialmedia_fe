import api from './axios';
import type { Notification, ApiResponse } from '@/types';

export const notificationsApi = {
    getAll: () =>
        api.get<Notification[]>('/notifications'),

    getUnread: () =>
        api.get<Notification[]>('/notifications/unread'),

    markAsRead: (id: number) =>
        api.put<ApiResponse>(`/notifications/${id}/read`),

    markAllAsRead: () =>
        api.put<ApiResponse>('/notifications/read-all'),

    deleteNotification: (id: number) =>
        api.delete<ApiResponse>(`/notifications/${id}`),
};
