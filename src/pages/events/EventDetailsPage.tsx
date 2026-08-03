import axios from 'axios';
import { Calendar, MapPin, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { eventsApi } from '@/api/events';
import { reviewsApi } from '@/api/reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse, Event, EventParticipant, EventParticipantSummary, EventReview } from '@/types';
import { AVATAR_PLACEHOLDER, EVENT_PLACEHOLDER } from '@/utils/constants';
import { getImageUrl } from '@/utils/image';

const getErrorMessage = (err: unknown, fallback: string) => {
    if (!axios.isAxiosError<ApiResponse<Record<string, string>>>(err)) {
        return fallback;
    }

    const validationErrors = err.response?.data?.data;
    if (validationErrors && typeof validationErrors === 'object' && !Array.isArray(validationErrors)) {
        const messages = Object.values(validationErrors).filter(
            (message): message is string => Boolean(message)
        );
        if (messages.length > 0) {
            return messages.join(' ');
        }
    }

    return err.response?.data?.message || err.message || fallback;
};

export default function EventDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { user: currentUser } = useAuthStore();
    const [event, setEvent] = useState<Event | null>(null);
    // The roster is host-only and closed after expiry, so it stays empty for most viewers.
    // Everything the UI needs about attendance in the general case comes from `summary`.
    const [participants, setParticipants] = useState<EventParticipant[]>([]);
    const [summary, setSummary] = useState<EventParticipantSummary | null>(null);
    const [reviews, setReviews] = useState<EventReview[]>([]);
    const [reviewText, setReviewText] = useState('');
    const [reviewStars, setReviewStars] = useState(5);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Only calls that exist on *both* the old and new backend go in this Promise.all.
                // Anything version-dependent is fetched separately below, so a version skew during
                // deploy degrades one section of the page instead of rejecting the whole load.
                const [eventRes, reviewsRes] = await Promise.all([
                    eventsApi.getEvent(Number(id)),
                    reviewsApi.getEventReviews(Number(id)),
                ]);
                const loadedEvent = eventRes.data;
                setEvent(loadedEvent);
                setReviews(reviewsRes.data);

                const { summary: loadedSummary, roster } = await loadAttendance(loadedEvent);
                setSummary(loadedSummary);
                setParticipants(roster ?? []);
                setPageError('');
            } catch (err) {
                console.error(err);
                setPageError(getErrorMessage(err, 'Failed to load event details.'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, currentUser?.id]);

    const viewerIsHostOf = (loadedEvent: Event) =>
        Boolean(currentUser && loadedEvent.organizer.id === currentUser.id);

    /**
     * Resolves attendance without assuming which backend version is deployed.
     *
     * The frontend and backend deploy independently, so there is always a window where one is
     * ahead of the other. Both attendance endpoints are version-sensitive in opposite directions:
     * `/participant-summary` does not exist on the old backend, and `/participants` is public
     * there but host-only here. Neither may be allowed to reject the page load.
     *
     * Preferred path is the summary. If it fails, fall back to the roster — which the old backend
     * serves to everyone — and synthesize the same shape from it. If both fail, fall back to the
     * count already carried on the event itself, which every version has returned.
     */
    const loadAttendance = async (
        loadedEvent: Event,
    ): Promise<{ summary: EventParticipantSummary; roster: EventParticipant[] | null }> => {
        try {
            const summaryRes = await eventsApi.getParticipantSummary(loadedEvent.id);
            return {
                summary: summaryRes.data,
                roster: await loadRosterIfHost(loadedEvent, summaryRes.data),
            };
        } catch (err) {
            console.error(err);
        }

        // Summary unavailable — older backend, or a transient failure.
        try {
            const rosterRes = await eventsApi.getParticipants(loadedEvent.id);
            return {
                summary: deriveSummary(loadedEvent, rosterRes.data),
                // Reuse the roster we already have rather than requesting it twice.
                roster: viewerIsHostOf(loadedEvent) ? rosterRes.data : null,
            };
        } catch (err) {
            console.error(err);
            return { summary: deriveSummary(loadedEvent, null), roster: null };
        }
    };

    /** Builds the summary shape from whatever the current backend was willing to give us. */
    const deriveSummary = (
        loadedEvent: Event,
        roster: EventParticipant[] | null,
    ): EventParticipantSummary => ({
        eventId: loadedEvent.id,
        participantCount: roster ? roster.length : loadedEvent.currentParticipantsCount,
        maxParticipants: loadedEvent.maxParticipants ?? null,
        expired:
            loadedEvent.expired ??
            (loadedEvent.status === 'ENDED' ||
                (loadedEvent.endTime ? new Date(loadedEvent.endTime) < new Date() : false)),
        // null means "unknown", which renders the RSVP button in its default state rather than
        // wrongly claiming the viewer is or is not attending.
        viewerAttending:
            roster && currentUser
                ? roster.some((participant) => participant.user.id === currentUser.id)
                : null,
    });

    /**
     * The roster is host-only and closed after expiry. A refusal is not a page failure — the
     * headcount still renders — so this resolves to null rather than throwing.
     */
    const loadRosterIfHost = async (
        loadedEvent: Event,
        loadedSummary: EventParticipantSummary,
    ): Promise<EventParticipant[] | null> => {
        if (!viewerIsHostOf(loadedEvent) || loadedSummary.expired) {
            return null;
        }
        try {
            const rosterRes = await eventsApi.getParticipants(loadedEvent.id);
            return rosterRes.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // Attendance now comes from the summary rather than from scanning the roster, because the
    // roster is no longer available to the person asking.
    const isAttending = Boolean(summary?.viewerAttending);
    const hasReviewed = Boolean(currentUser && reviews.some((review) => review.reviewer.id === currentUser.id));
    const isHost = Boolean(currentUser && event && event.organizer.id === currentUser.id);
    const participantCount = summary?.participantCount ?? event?.currentParticipantsCount ?? 0;
    const rosterVisible = isHost && !summary?.expired && participants.length > 0;
    const canReview = Boolean(event && event.status === 'ENDED' && isAttending && !isHost && !hasReviewed);

    const reviewHelperText = !event
        ? ''
        : event.status !== 'ENDED'
            ? 'Reviews open after the event ends.'
            : isHost
                ? 'Hosts cannot review their own events.'
                : hasReviewed
                    ? 'You have already reviewed this event.'
                    : !isAttending
                        ? 'Only attendees can review this event.'
                        : '';

    const refreshEventData = async (eventId: number) => {
        const eventRes = await eventsApi.getEvent(eventId);
        setEvent(eventRes.data);

        // Same version-tolerant path as the initial load — a post-RSVP refresh must not be the
        // thing that surfaces a deploy skew as an error.
        const { summary: refreshedSummary, roster } = await loadAttendance(eventRes.data);
        setSummary(refreshedSummary);
        setParticipants(roster ?? []);
    };

    const handleRSVP = async () => {
        if (!id || isAttending) {
            return;
        }

        try {
            await eventsApi.joinEvent(Number(id), 'GOING');
            await refreshEventData(Number(id));
            setPageError('');
        } catch (err) {
            console.error(err);
            setPageError(getErrorMessage(err, 'Failed to RSVP for this event.'));
        }
    };

    const handleReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) {
            return;
        }

        if (!canReview) {
            setReviewError(reviewHelperText || 'You cannot review this event right now.');
            return;
        }

        try {
            const res = await reviewsApi.submitReview(Number(id), { stars: reviewStars, reviewText: reviewText.trim() || undefined });
            setReviews((prev) => [res.data, ...prev]);
            setReviewText('');
            setReviewStars(5);
            setReviewError('');
        } catch (err) {
            console.error(err);
            setReviewError(getErrorMessage(err, 'Failed to submit your review.'));
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
    }

    if (!event) {
        return <div className="py-20 text-center text-muted-foreground">Event not found</div>;
    }

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {pageError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {pageError}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <img src={getImageUrl(event.mediaFiles?.[0]) || EVENT_PLACEHOLDER} alt={event.title} className="aspect-[16/9] w-full object-cover" />
                <div className="p-6">
                    <div className="mb-4 flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{event.title}</h1>
                        <Badge className={event.status === 'ACTIVE' ? 'bg-[var(--color-spotify-green)] text-[#0B0B0B]' : 'bg-[var(--color-bg-card-hover)] text-[var(--color-text-secondary)]'}>{event.status}</Badge>
                    </div>
                    {event.description && <p className="mb-4 text-muted-foreground">{event.description}</p>}
                    <div className="mb-6 grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-primary" />{new Date(event.startTime).toLocaleString()}</div>
                        {event.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" />{event.location}</div>}
                        <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" />{event.currentParticipantsCount}/{event.maxParticipants} attendees</div>
                        <div className="flex items-center gap-2 text-sm">
                            <img src={getImageUrl(event.organizer.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-5 w-5 rounded-full object-cover" />
                            Host: {event.organizer.username}
                        </div>
                    </div>
                    {event.status === 'ACTIVE' && (
                        <Button onClick={handleRSVP} className="rounded-full font-semibold" disabled={isAttending}>
                            {isAttending ? "You're Going" : "RSVP - I'm Going!"}
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Attendees ({participantCount})</h2>
                {rosterVisible ? (
                    <div className="flex flex-wrap gap-2">
                        {participants.map((participant) => (
                            <div key={participant.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                                <img src={getImageUrl(participant.user.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-6 w-6 rounded-full object-cover" />
                                <span className="text-sm font-medium">{participant.user.username}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {summary?.expired
                            ? `${participantCount} ${participantCount === 1 ? 'person' : 'people'} attended this event.`
                            : 'Only the host can see who is attending.'}
                    </p>
                )}
                {isHost && !summary?.expired && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        You can see this list because you are hosting. It closes once the event ends.
                    </p>
                )}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold">Reviews ({reviews.length})</h2>
                {event.status === 'ENDED' && (
                    <>
                        {reviewHelperText && (
                            <div className="mb-4 rounded-xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
                                {reviewHelperText}
                            </div>
                        )}
                        {reviewError && (
                            <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {reviewError}
                            </div>
                        )}
                        {canReview && (
                            <form onSubmit={handleReview} className="mb-6 space-y-3 rounded-xl bg-secondary/50 p-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((stars) => (
                                        <button key={stars} type="button" onClick={() => setReviewStars(stars)}>
                                            <Star className={`h-6 w-6 ${stars <= reviewStars ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                                        </button>
                                    ))}
                                </div>
                                <Textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="rounded-xl"
                                    rows={3}
                                />
                                <Button type="submit" className="rounded-full font-semibold">Submit Review</Button>
                            </form>
                        )}
                    </>
                )}
                <div className="space-y-4">
                    {reviews.length === 0 && (
                        <div className="rounded-xl bg-secondary/30 px-4 py-6 text-center text-sm text-muted-foreground">
                            No reviews yet.
                        </div>
                    )}
                    {reviews.map((review) => (
                        <div key={review.id} className="flex gap-3 rounded-xl bg-secondary/30 p-4">
                            <img src={getImageUrl(review.reviewer.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-8 w-8 rounded-full object-cover" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{review.reviewer.username}</span>
                                    <div className="flex">
                                        {Array.from({ length: review.stars }).map((_, index) => (
                                            <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                                        ))}
                                    </div>
                                </div>
                                {review.reviewText && <p className="mt-1 text-sm text-muted-foreground">{review.reviewText}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
