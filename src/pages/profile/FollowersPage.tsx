import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { followsApi } from '@/api/follows';
import { usersApi } from '@/api/users';
import type { User } from '@/types';
import { AVATAR_PLACEHOLDER } from '@/utils/constants';
import { getImageUrl } from '@/utils/image';

export default function FollowersPage() {
    const { username } = useParams<{ username: string }>();
    const [followers, setFollowers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;
        const fetch = async () => {
            try {
                const profileRes = await usersApi.getUserProfile(username);
                const res = await followsApi.getFollowers(profileRes.data.id);
                setFollowers(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [username]);

    if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Followers</h1>
            {followers.length === 0 ? (
                <p className="text-muted-foreground">No followers yet.</p>
            ) : followers.map((u) => (
                <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all hover:bg-primary/5">
                    <img src={getImageUrl(u.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-12 w-12 rounded-full object-cover" />
                    <div><p className="font-semibold">{u.username}</p><p className="text-sm text-muted-foreground">{u.fullName}</p></div>
                </Link>
            ))}
        </div>
    );
}
