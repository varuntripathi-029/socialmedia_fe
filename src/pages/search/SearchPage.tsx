import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { usersApi } from '@/api/users';
import type { User } from '@/types';
import { AVATAR_PLACEHOLDER } from '@/utils/constants';
import { getImageUrl } from '@/utils/image';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (value: string) => {
        setQuery(value);
        if (value.trim().length < 2) {
            setResults([]);
            return;
        }
        setLoading(true);
        try {
            const res = await usersApi.searchUsers(value);
            setResults(res.data);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Search</h1>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users..."
                    className="rounded-xl pl-10"
                />
            </div>

            {loading && <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>}

            <div className="space-y-2">
                {results.map((user) => (
                    <Link key={user.id} to={`/profile/${user.username}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 transition-all hover:bg-primary/5 hover:shadow-sm">
                        <img src={getImageUrl(user.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-12 w-12 rounded-full object-cover" />
                        <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.fullName}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
