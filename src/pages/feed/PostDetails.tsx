import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { postsApi } from '@/api/posts';
import { commentsApi } from '@/api/comments';
import type { Post, Comment } from '@/types';
import { AVATAR_PLACEHOLDER } from '@/utils/constants';
import { getImageUrl } from '@/utils/image';

export default function PostDetails() {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const [postRes, commentsRes] = await Promise.all([
                    postsApi.getPost(Number(id)),
                    commentsApi.getComments(Number(id)),
                ]);
                setPost(postRes.data);
                setComments(commentsRes.data);
            } catch (err) {
                console.error('Failed to fetch post', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !id) return;
        try {
            const res = await commentsApi.createComment(Number(id), newComment);
            setComments(prev => [res.data, ...prev]);
            setNewComment('');
        } catch (err) {
            console.error('Failed to post comment', err);
        }
    };

    const handleLike = async () => {
        if (!post) return;
        try {
            if (post.isLikedByCurrentUser) {
                await postsApi.unlikePost(post.id);
            } else {
                await postsApi.likePost(post.id);
            }
            setPost({ ...post, isLikedByCurrentUser: !post.isLikedByCurrentUser, likesCount: post.isLikedByCurrentUser ? post.likesCount - 1 : post.likesCount + 1 });
        } catch (err) {
            console.error('Like failed', err);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
    }

    if (!post) return <div className="py-20 text-center text-muted-foreground">Post not found</div>;

    return (
        <div className="mx-auto max-w-2xl">
            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center gap-3 p-4">
                    <Link to={`/profile/${post.user.username}`}>
                        <img src={getImageUrl(post.user.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-10 w-10 rounded-full object-cover" />
                    </Link>
                    <div>
                        <Link to={`/profile/${post.user.username}`} className="font-semibold hover:underline">{post.user.username}</Link>
                        <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                {post.imageUrl && (
                    <img src={getImageUrl(post.imageUrl)} alt="Post" className="w-full object-cover" />
                )}
                <div className="p-4">
                    <div className="mb-3 flex items-center gap-4">
                        <button onClick={handleLike} className="flex items-center gap-1.5">
                            <Heart className={`h-6 w-6 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-400'}`} />
                            <span className="text-sm font-medium">{post.likesCount}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <MessageCircle className="h-6 w-6" />
                            <span className="text-sm font-medium">{comments.length}</span>
                        </div>
                    </div>
                    {post.caption && <p className="mb-4 text-sm"><span className="mr-1 font-semibold">{post.user.username}</span>{post.caption}</p>}

                    {/* Comments */}
                    <div className="space-y-3 border-t pt-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={getImageUrl(comment.user.profileImageUrl) || AVATAR_PLACEHOLDER} alt="" className="h-8 w-8 rounded-full object-cover" />
                                <div>
                                    <p className="text-sm"><span className="mr-1 font-semibold">{comment.user.username}</span>{comment.content}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comment input */}
                    <form onSubmit={handleComment} className="mt-4 flex gap-2 border-t pt-4">
                        <Input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="rounded-xl" />
                        <Button type="submit" size="icon" variant="ghost" disabled={!newComment.trim()}><Send className="h-5 w-5" /></Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
