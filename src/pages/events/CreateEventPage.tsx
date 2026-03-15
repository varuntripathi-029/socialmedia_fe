import axios from 'axios';
import { ImagePlus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsApi } from '@/api/events';
import { postsApi } from '@/api/posts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ApiResponse } from '@/types';

export default function CreateEventPage() {
    const [form, setForm] = useState({
        title: '', description: '', location: '', startTime: '', endTime: '',
        maxParticipants: 50, city: '', eventType: '', collegeName: '', dressCode: '', targetAudience: '',
    });
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const buildPayload = (mediaFiles: string[]) => ({
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim(),
        startTime: form.startTime,
        endTime: form.endTime,
        maxParticipants: Number(form.maxParticipants),
        city: form.city.trim(),
        eventType: form.eventType.trim(),
        collegeName: form.collegeName.trim() || undefined,
        dressCode: form.dressCode.trim() || undefined,
        targetAudience: form.targetAudience.trim() || undefined,
        mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
    });

    const validatePayload = (payload: ReturnType<typeof buildPayload>) => {
        if (!payload.title || !payload.location || !payload.city || !payload.eventType) {
            return 'Please fill in all required fields.';
        }

        if (!Number.isFinite(payload.maxParticipants) || payload.maxParticipants < 1) {
            return 'Max participants must be at least 1.';
        }

        const startTime = new Date(payload.startTime);
        const endTime = new Date(payload.endTime);
        const now = new Date();

        if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
            return 'Please choose valid start and end times.';
        }

        if (startTime <= now) {
            return 'Start time must be in the future.';
        }

        if (endTime <= now) {
            return 'End time must be in the future.';
        }

        if (endTime <= startTime) {
            return 'End time must be after the start time.';
        }

        return '';
    };

    const getErrorMessage = (err: unknown) => {
        if (!axios.isAxiosError<ApiResponse<Record<string, string>>>(err)) {
            return 'Failed to create event';
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

        return err.response?.data?.message || err.message || 'Failed to create event';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const draftPayload = buildPayload([]);
            const validationError = validatePayload(draftPayload);
            if (validationError) {
                setError(validationError);
                return;
            }

            let mediaFiles: string[] = [];

            if (bannerFile) {
                const formData = new FormData();
                formData.append('file', bannerFile);
                const uploadRes = await postsApi.uploadMedia(formData);
                const uploadedUrl = uploadRes.data.data || '';
                if (uploadedUrl) {
                    mediaFiles = [uploadedUrl];
                }
            }

            const payload = buildPayload(mediaFiles);
            await eventsApi.createEvent(payload);
            navigate('/events');
        } catch (err) {
            console.error(err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl">
            <h1 className="mb-6 text-2xl font-bold">Create Event</h1>
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                    <div className="space-y-2"><Label>Title *</Label><Input name="title" value={form.title} onChange={handleChange} required className="rounded-xl" /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea name="description" value={form.description} onChange={handleChange} className="rounded-xl" rows={3} /></div>

                    {/* Banner Image Upload */}
                    <div className="space-y-2">
                        <Label>Event Banner (optional)</Label>
                        <div className="flex flex-col items-center gap-3">
                            {bannerPreview && (
                                <img src={bannerPreview} alt="Banner Preview" className="aspect-[16/9] w-full rounded-xl object-cover ring-2 ring-primary/20" />
                            )}
                            <label className="flex w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5">
                                <ImagePlus className="mr-2 h-5 w-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{bannerFile ? bannerFile.name : 'Upload banner image'}</span>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setBannerFile(e.target.files[0]);
                                            setBannerPreview(URL.createObjectURL(e.target.files[0]));
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Start Time *</Label><Input name="startTime" type="datetime-local" value={form.startTime} onChange={handleChange} required className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>End Time *</Label><Input name="endTime" type="datetime-local" value={form.endTime} onChange={handleChange} required className="rounded-xl" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Location *</Label><Input name="location" value={form.location} onChange={handleChange} required className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>City *</Label><Input name="city" value={form.city} onChange={handleChange} required className="rounded-xl" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Max Participants *</Label><Input name="maxParticipants" type="number" min="1" value={form.maxParticipants} onChange={handleChange} required className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>Event Type *</Label><Input name="eventType" value={form.eventType} onChange={handleChange} required className="rounded-xl" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Dress Code</Label><Input name="dressCode" value={form.dressCode} onChange={handleChange} className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>Target Audience</Label><Input name="targetAudience" value={form.targetAudience} onChange={handleChange} className="rounded-xl" /></div>
                    </div>
                    <div className="space-y-2"><Label>College Name</Label><Input name="collegeName" value={form.collegeName} onChange={handleChange} className="rounded-xl" /></div>
                    <Button type="submit" className="w-full rounded-xl py-5 font-semibold" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
