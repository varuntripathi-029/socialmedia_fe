import api from './axios';
import type { Post, ApiResponse } from '@/types';

export const postsApi = {
    getFeed: () =>
        api.get<Post[]>('/posts/feed'),

    getPost: (id: number) =>
        api.get<Post>(`/posts/${id}`),

    createPost: (data: { caption?: string; imageUrl: string }) =>
        api.post<Post>('/posts', data),

    uploadMedia: (formData: FormData) =>
        api.post<ApiResponse<string>>('/posts/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    likePost: (id: number) =>
        api.post<ApiResponse>(`/posts/${id}/like`),

    unlikePost: (id: number) =>
        api.delete<ApiResponse>(`/posts/${id}/like`),

    deletePost: (id: number) =>
        api.delete<ApiResponse>(`/posts/${id}`),
};
