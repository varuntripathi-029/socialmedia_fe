import api from './axios';
import type { EventReview } from '@/types';

export const reviewsApi = {
    submitReview: (eventId: number, data: { stars: number; reviewText?: string }) =>
        api.post<EventReview>(`/events/${eventId}/reviews`, data),

    getEventReviews: (eventId: number) =>
        api.get<EventReview[]>(`/events/${eventId}/reviews`),
};
