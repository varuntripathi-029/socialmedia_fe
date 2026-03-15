import api from './axios';
import type { Event, EventParticipant, ApiResponse } from '@/types';

export const eventsApi = {
    getEvents: () =>
        api.get<Event[]>('/events'),

    getEvent: (id: number) =>
        api.get<Event>(`/events/${id}`),

    createEvent: (data: {
        title: string;
        description?: string;
        location: string;
        startTime: string;
        endTime: string;
        maxParticipants: number;
        city: string;
        eventType: string;
        collegeName?: string;
        dressCode?: string;
        targetAudience?: string;
        mediaFiles?: string[];
    }) =>
        api.post<Event>('/events', data),

    joinEvent: (eventId: number, rsvpStatus: string) =>
        api.post<EventParticipant>(`/events/${eventId}/join`, null, {
            params: { rsvpStatus },
        }),

    leaveEvent: (eventId: number) =>
        api.delete<ApiResponse>(`/events/${eventId}/leave`),

    endEvent: (eventId: number) =>
        api.put<Event>(`/events/${eventId}/end`),

    deleteEvent: (eventId: number) =>
        api.delete<ApiResponse>(`/events/${eventId}`),

    getParticipants: (eventId: number) =>
        api.get<EventParticipant[]>(`/events/${eventId}/participants`),
};
