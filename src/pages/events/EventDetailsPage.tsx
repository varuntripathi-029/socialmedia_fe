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
import type { ApiResponse, Event, EventParticipant, EventReview } from '@/types';
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
    const [participants, setParticipants] = useState<EventParticipant[]>([]);
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
                const [eventRes, participantsRes, reviewsRes] = await Promise.all([
                    eventsApi.getEvent(Number(id)),
                    eventsApi.getParticipants(Number(id)),
                    reviewsApi.getEventReviews(Number(id)),
                ]);
                setEvent(eventRes.data);
                setParticipants(participantsRes.data);
                setReviews(reviewsRes.data);
                setPageError('');
            } catch (err) {
                console.error(err);
                setPageError(getErrorMessage(err, 'Failed to load event details.'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const isAttending = Boolean(currentUser && participants.some((participant) => participant.user.id === currentUser.id));
    const hasReviewed = Boolean(currentUser && reviews.some((review) => review.reviewer.id === currentUser.id));
    const isHost = Boolean(currentUser && event && event.organizer.id === currentUser.id);
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
        const [eventRes, participantsRes] = await Promise.all([
            eventsApi.getEvent(eventId),
            eventsApi.getParticipants(eventId),
        ]);
        setEvent(eventRes.data);
        setParticipants(participantsRes.data);
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
                        <Badge className={event.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>{event.status}</Badge>
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
                <h2 className="mb-4 text-lg font-bold">Attendees ({participants.length})</h2>
                <div className="flex flex-wrap gap-2">
                    {participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                            <img src={getImageUrl(participant.user.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-6 w-6 rounded-full object-cover" />
                            <span className="text-sm font-medium">{participant.user.username}</span>
                        </div>
                    ))}
                </div>
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
