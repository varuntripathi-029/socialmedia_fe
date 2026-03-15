import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { eventsApi } from '@/api/events';
import type { Event } from '@/types';
import { EVENT_PLACEHOLDER, AVATAR_PLACEHOLDER } from '@/utils/constants';
import { getImageUrl } from '@/utils/image';

export default function EventsListPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await eventsApi.getEvents();
                setEvents(res.data);
            } catch (err) {
                console.error('Failed to fetch events', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Events</h1>
                <Link to="/create-event">
                    <Button className="rounded-full font-semibold">Create Event</Button>
                </Link>
            </div>

            {events.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">No events yet. Be the first to create one!</div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                    {events.map((event) => (
                        <Link key={event.id} to={`/events/${event.id}`} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img src={getImageUrl(event.mediaFiles?.[0]) || EVENT_PLACEHOLDER} alt={event.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                <Badge className={`absolute right-3 top-3 ${event.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                                    {event.status}
                                </Badge>
                            </div>
                            <div className="p-4">
                                <h3 className="mb-2 text-lg font-bold">{event.title}</h3>
                                <div className="space-y-1.5 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <img src={getImageUrl(event.organizer.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-5 w-5 rounded-full object-cover" />
                                        <span>{event.organizer.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(event.startTime).toLocaleDateString()}</div>
                                    {event.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</div>}
                                    <div className="flex items-center gap-2"><Users className="h-4 w-4" />{event.currentParticipantsCount}/{event.maxParticipants}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
