import api from './axios';
import type { Comment, ApiResponse } from '@/types';

export const commentsApi = {
    getComments: (postId: number) =>
        api.get<Comment[]>(`/posts/${postId}/comments`),

    createComment: (postId: number, content: string) =>
        api.post<Comment>(`/posts/${postId}/comments`, { content }),

    deleteComment: (commentId: number) =>
        api.delete<ApiResponse>(`/comments/${commentId}`),
};
