import api from './axios';
import type { Event, EventParticipant, EventParticipantSummary, ApiResponse } from '@/types';

export const eventsApi = {
    getEvents: () =>
        api.get<Event[]>('/events'),

    getTrendingEvents: () =>
        api.get<Event[]>('/events/trending'),

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

    /**
     * The full attendee roster. Host-only, and the backend refuses it entirely once the event has
     * expired — call this only when the current user organizes a still-active event, otherwise it
     * returns 403.
     */
    getParticipants: (eventId: number) =>
        api.get<EventParticipant[]>(`/events/${eventId}/participants`),

    /**
     * Headcount plus whether *you* are attending. Public, works for anonymous visitors, and is
     * what every non-host view should use — it carries no attendee identities.
     */
    getParticipantSummary: (eventId: number) =>
        api.get<EventParticipantSummary>(`/events/${eventId}/participant-summary`),
};
