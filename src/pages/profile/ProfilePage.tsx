import axios from 'axios';
import { Loader2, LogOut, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '@/api/events';
import { followsApi } from '@/api/follows';
import { postsApi } from '@/api/posts';
import { usersApi } from '@/api/users';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse, ProfileContent, UserProfile } from '@/types';
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

export default function ProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser, logout } = useAuthStore();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [content, setContent] = useState<ProfileContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionError, setActionError] = useState('');
    const [deletingKey, setDeletingKey] = useState<string | null>(null);
    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        if (!username) {
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const profileRes = await usersApi.getUserProfile(username);
                setProfile(profileRes.data);

                const contentRes = await usersApi.getUserContent(profileRes.data.id);
                setContent(contentRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    const handleFollow = async () => {
        if (!profile) {
            return;
        }

        try {
            if (profile.isFollowing) {
                await followsApi.unfollowUser(profile.id);
                setProfile((prev) => prev ? { ...prev, isFollowing: false, followersCount: prev.followersCount - 1 } : null);
            } else if (profile.isPrivate) {
                await followsApi.requestFollow(profile.id);
            } else {
                await followsApi.followUser(profile.id);
                setProfile((prev) => prev ? { ...prev, isFollowing: true, followersCount: prev.followersCount + 1 } : null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteContent = async (item: ProfileContent) => {
        const label = item.type === 'POST' ? 'post' : 'event';
        const deleteKey = `${item.type}-${item.id}`;

        if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) {
            return;
        }

        setDeletingKey(deleteKey);
        setActionError('');

        try {
            if (item.type === 'POST') {
                await postsApi.deletePost(item.id);
            } else {
                await eventsApi.deleteEvent(item.id);
            }

            setContent((prev) => prev.filter((entry) => !(entry.type === item.type && entry.id === item.id)));
        } catch (err) {
            console.error(err);
            setActionError(getErrorMessage(err, `Failed to delete this ${label}.`));
        } finally {
            setDeletingKey(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
    }

    if (!profile) {
        return <div className="py-20 text-center text-muted-foreground">User not found</div>;
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                    <img src={getImageUrl(profile.profileImageUrl) || AVATAR_PLACEHOLDER} alt={profile.username} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20" />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold">{profile.username}</h1>
                        <p className="text-muted-foreground">{profile.fullName}</p>
                        {profile.bio && <p className="mt-2 text-sm">{profile.bio}</p>}
                        <div className="mt-4 flex items-center justify-center gap-6 sm:justify-start">
                            <Link to={`/profile/${username}/followers`} className="text-center hover:text-primary">
                                <span className="block text-lg font-bold">{profile.followersCount}</span>
                                <span className="text-xs text-muted-foreground">Followers</span>
                            </Link>
                            <Link to={`/profile/${username}/following`} className="text-center hover:text-primary">
                                <span className="block text-lg font-bold">{profile.followingCount}</span>
                                <span className="text-xs text-muted-foreground">Following</span>
                            </Link>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        {isOwnProfile ? (
                            <>
                                <Link to="/profile/edit"><Button variant="outline" className="rounded-full font-semibold">Edit Profile</Button></Link>
                                <Button
                                    onClick={handleLogout}
                                    className="w-[40%] min-w-[120px] rounded-full border-none bg-emerald-500 font-semibold text-white hover:bg-emerald-600"
                                >
                                    <LogOut className="mr-1.5 h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleFollow} className="rounded-full font-semibold" variant={profile.isFollowing ? 'outline' : 'default'}>
                                {profile.isFollowing ? 'Following' : profile.isPrivate ? 'Request Follow' : 'Follow'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {actionError && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {actionError}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {content.map((item) => {
                    const deleteKey = `${item.type}-${item.id}`;
                    const isDeleting = deletingKey === deleteKey;

                    return (
                        <div key={deleteKey} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={() => void handleDeleteContent(item)}
                                    className="absolute left-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                                    aria-label={`Delete ${item.type === 'POST' ? 'post' : 'event'}`}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </button>
                            )}

                            <Badge className={`absolute right-3 top-3 z-10 ${item.type === 'POST' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                                {item.type}
                            </Badge>

                            {item.type === 'POST' ? (
                                <Link to={`/post/${item.id}`}>
                                    <img
                                        src={getImageUrl(item.imageUrl) || AVATAR_PLACEHOLDER}
                                        alt={item.caption || 'Post image'}
                                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                </Link>
                            ) : (
                                <Link to={`/events/${item.id}`}>
                                    <img
                                        src={getImageUrl(item.mediaFiles?.[0]) || EVENT_PLACEHOLDER}
                                        alt={item.title}
                                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="p-3">
                                        <h3 className="text-sm font-semibold">{item.title}</h3>
                                    </div>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
