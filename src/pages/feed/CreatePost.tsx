import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImagePlus } from 'lucide-react';
import { postsApi } from '@/api/posts';

export default function CreatePost() {
    const [caption, setCaption] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            setFiles(selected);
            setPreviews(selected.map(f => URL.createObjectURL(f)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (files.length === 0) {
            setError('Please select an image');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Step 1: upload image
            const uploadData = new FormData();
            uploadData.append('file', files[0]);

            const uploadRes = await postsApi.uploadMedia(uploadData);
            const imageUrl = uploadRes.data.data!;

            // Step 2: create post
            await postsApi.createPost({
                caption,
                imageUrl
            });

            navigate('/feed');

        } catch (err) {
            console.error(err);
            setError('Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-6 text-2xl font-bold">Create Post</h1>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                    <div className="space-y-2">
                        <Label>Media</Label>
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-primary/5">
                            <ImagePlus className="mb-2 h-10 w-10 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Click to upload images or videos</span>
                            <Input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
                        </label>
                        {previews.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {previews.map((p, i) => (
                                    <img key={i} src={p} alt="" className="aspect-square rounded-xl object-cover" />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="caption">Caption</Label>
                        <Textarea id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="What's on your mind?" className="rounded-xl" rows={4} />
                    </div>

                    <Button type="submit" className="w-full rounded-xl py-5 font-semibold" disabled={loading}>
                        {loading ? 'Posting...' : 'Share Post'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
