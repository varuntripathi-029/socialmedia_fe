import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/api/users';
import { postsApi } from '@/api/posts';
import { ImagePlus } from 'lucide-react';
import { getImageUrl } from '@/utils/image';

export default function EditProfilePage() {
    const { user, setUser } = useAuthStore();
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState(user?.profileImageUrl || '');
    const [profileImageUrl, setProfileImageUrl] = useState(user?.profileImageUrl || '');
    const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let latestImageUrl = profileImageUrl;
            if (profileImageFile) {
                const formData = new FormData();
                formData.append('file', profileImageFile);
                const uploadRes = await postsApi.uploadMedia(formData);
                latestImageUrl = uploadRes.data.data || '';
                setProfileImageUrl(latestImageUrl);
            }

            await usersApi.updateProfile({ username, bio, profileImageUrl: latestImageUrl, isPrivate });
            const res = await usersApi.getMe();
            setUser(res.data);
            setSuccess('Profile updated!');
            setTimeout(() => navigate(`/profile/${username}`), 1000);
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-6 text-2xl font-bold">Edit Profile</h1>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    {success && <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-600">{success}</div>}
                    <div className="space-y-2"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl" required /></div>
                    <div className="space-y-2"><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl" rows={3} /></div>
                    
                    <div className="space-y-2">
                        <Label>Profile Image</Label>
                        <div className="flex items-center gap-4">
                            {profileImagePreview && (
                                <img src={getImageUrl(profileImagePreview)} alt="Profile Preview" className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" />
                            )}
                            <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-2 transition-colors hover:border-primary/50 hover:bg-primary/5">
                                <ImagePlus className="mr-2 h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Select file</span>
                                <Input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setProfileImageFile(e.target.files[0]);
                                        setProfileImagePreview(URL.createObjectURL(e.target.files[0]));
                                    }
                                }} />
                            </label>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="private" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="h-4 w-4 rounded border-gray-300 accent-primary" />
                        <Label htmlFor="private" className="cursor-pointer">Private Account</Label>
                    </div>
                    <Button type="submit" className="w-full rounded-xl py-5 font-semibold" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
