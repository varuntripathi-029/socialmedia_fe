export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    bio?: string;
    profileImageUrl?: string;
    isPrivate: boolean;
    hostRating?: number;
    ratingCount?: number;
    createdAt: string;
}

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName: string;
    bio?: string;
    profileImageUrl?: string;
    isPrivate: boolean;
    isFollowing: boolean;
    followersCount: number;
    followingCount: number;
    hostRating?: number;
    ratingCount?: number;
    createdAt: string;
}

export interface Post {
    id: number
    imageUrl: string
    caption?: string
    createdAt: string
    updatedAt?: string

    likesCount: number
    commentsCount: number
    isLikedByCurrentUser: boolean

    user: {
        id: number
        username: string
        email: string
        fullName: string
        bio?: string
        profileImageUrl?: string
    }
}

export interface Comment {
    id: number;
    user: User;
    content: string;
    createdAt: string;
}

export interface Event {
    id: number;
    title: string;
    description?: string;
    location?: string;
    startTime: string;
    endTime?: string;
    maxParticipants: number;
    city?: string;
    eventType?: string;
    collegeName?: string;
    dressCode?: string;
    targetAudience?: string;
    status: string;
    organizer: User;
    mediaFiles: string[];
    createdAt: string;
    currentParticipantsCount: number;
    /** True once the host ended the event or its endTime passed. */
    expired?: boolean;
    type?: string;
}

export interface EventParticipant {
    id: number;
    eventId: number;
    user: User;
    rsvpStatus: string;
    joinedAt: string;
}

/**
 * What non-hosts get instead of the roster: a headcount and your own attendance, never names.
 */
export interface EventParticipantSummary {
    eventId: number;
    participantCount: number;
    maxParticipants: number | null;
    expired: boolean;
    /** null when the caller is not logged in. */
    viewerAttending: boolean | null;
}

export interface EventReview {
    id: number;
    eventId: number;
    reviewer: User;
    stars: number;
    reviewText?: string;
    createdAt: string;
}

export interface Notification {
    id: number;
    recipientUserId: number;
    actorUserId: number;
    actorUsername: string;
    notificationType: string;
    referenceId?: number;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface FollowRequest {
    id: number;
    follower: User;
    following: User;
    createdAt: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data?: T
}

export interface AuthResponse {
    token: string;
    username: string;
    needsUsername?: boolean;
}

export type ProfileContent =
    | (Post & { type: 'POST' })
    | (Event & { type: 'EVENT' });
