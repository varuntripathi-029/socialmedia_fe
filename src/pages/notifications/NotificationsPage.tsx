import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Bell } from 'lucide-react';
import { notificationsApi } from '@/api/notifications';
import { followsApi } from '@/api/follows';
import { useNotificationStore } from '@/store/notificationStore';
import type { Notification } from '@/types';
import { AVATAR_PLACEHOLDER } from '@/utils/constants';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { setUnreadCount } = useNotificationStore();

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await notificationsApi.getAll();
                setNotifications(res.data);
                setUnreadCount(res.data.filter(n => !n.isRead).length);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [setUnreadCount]);

    const handleMarkAllRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAcceptFollow = async (notif: Notification) => {
        try {
            if (notif.referenceId) await followsApi.acceptRequest(notif.referenceId);
            await notificationsApi.markAsRead(notif.id);
            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleRejectFollow = async (notif: Notification) => {
        try {
            if (notif.referenceId) await followsApi.rejectRequest(notif.referenceId);
            await notificationsApi.deleteNotification(notif.id);
            setNotifications(prev => prev.filter(n => n.id !== notif.id));
        } catch (err) {
            console.error(err);
        }
    };

    const getNotifColor = (type: string) => {
        switch (type) {
            case 'FOLLOW_REQUEST': return 'bg-blue-500';
            case 'NEW_FOLLOWER': return 'bg-green-500';
            case 'POST_LIKE': return 'bg-red-500';
            case 'POST_COMMENT': return 'bg-purple-500';
            case 'EVENT_RSVP': return 'bg-amber-500';
            case 'EVENT_REVIEW': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {notifications.some(n => !n.isRead) && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-sm font-medium text-primary">
                        Mark all read
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-20 text-center text-muted-foreground">
                    <Bell className="h-12 w-12" />
                    <p>No notifications yet</p>
                </div>
            ) : (
                notifications.map((notif) => (
                    <div key={notif.id} className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${notif.isRead ? 'bg-card' : 'bg-primary/5'}`}>
                        <img src={AVATAR_PLACEHOLDER} alt="" className="h-10 w-10 rounded-full object-cover" />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge className={`${getNotifColor(notif.notificationType)} text-white text-[10px]`}>
                                    {notif.notificationType.replace(/_/g, ' ')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm">{notif.message}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleString()}</p>
                        </div>
                        {notif.notificationType === 'FOLLOW_REQUEST' && !notif.isRead && (
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={() => handleAcceptFollow(notif)}>
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10" onClick={() => handleRejectFollow(notif)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
