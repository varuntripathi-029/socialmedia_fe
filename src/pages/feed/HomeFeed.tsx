import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle } from 'lucide-react';
import { postsApi } from '@/api/posts';
import type { Post } from '@/types';
import { AVATAR_PLACEHOLDER } from '@/utils/constants';
import { getImageUrl } from '@/utils/image';

export default function HomeFeed() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await postsApi.getFeed();
                setPosts(res.data);
            } catch (err) {
                console.error('Failed to fetch feed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const handleLike = async (post: Post) => {
        try {
            if (post.isLikedByCurrentUser) {
                await postsApi.unlikePost(post.id);
            } else {
                await postsApi.likePost(post.id);
            }
            setPosts(prev => prev.map(p => p.id === post.id ? {
                ...p,
                isLikedByCurrentUser: !p.isLikedByCurrentUser,
                likesCount: p.isLikedByCurrentUser ? p.likesCount - 1 : p.likesCount + 1,
            } : p));
        } catch (err) {
            console.error('Like failed', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="py-20 text-center">
                <h2 className="mb-2 text-xl font-bold">Your feed is empty</h2>
                <p className="text-muted-foreground">Follow others to see their posts here!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Home Feed</h1>
            {posts.map((post) => (
                <div key={post.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md">
                    {/* Post header */}
                    <div className="flex items-center gap-3 p-4">
                        <Link to={`/profile/${post.user.username}`}>
                            <img
                                src={getImageUrl(post.user.profileImageUrl) || AVATAR_PLACEHOLDER}
                                alt={post.user.username}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                            />
                        </Link>
                        <div>
                            <Link to={`/profile/${post.user.username}`} className="font-semibold hover:underline">
                                {post.user.username}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {/* Post media */}
                    {post.imageUrl && (
                        <Link to={`/post/${post.id}`}>
                            <img
                                src={getImageUrl(post.imageUrl)}
                                alt="Post"
                                className="aspect-square w-full object-cover"
                            />
                        </Link>
                    )}
                    {/* Post actions */}
                    <div className="p-4">
                        <div className="mb-2 flex items-center gap-4">
                            <button onClick={() => handleLike(post)} className="flex items-center gap-1.5 transition-colors">
                                <Heart className={`h-6 w-6 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'}`} />
                                <span className="text-sm font-medium">{post.likesCount}</span>
                            </button>
                            <Link to={`/post/${post.id}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary">
                                <MessageCircle className="h-6 w-6" />
                                <span className="text-sm font-medium">{post.commentsCount}</span>
                            </Link>
                        </div>
                        {post.caption && (
                            <p className="text-sm">
                                <Link to={`/profile/${post.user.username}`} className="mr-1 font-semibold">{post.user.username}</Link>
                                {post.caption}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
