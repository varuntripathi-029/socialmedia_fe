import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usersApi } from '@/api/users';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, XCircle } from 'lucide-react';
import { LOGO } from '@/utils/constants';

import { authApi } from '@/api/auth';

export default function ChooseUsernamePage() {
    const [username, setUsername] = useState('');
    const [available, setAvailable] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuthStore();

    useEffect(() => {
        const pendingSignup = sessionStorage.getItem('pendingSignup');
        if (!pendingSignup) {
            navigate('/signup');
        }
    }, [navigate]);

    const checkAvailability = async (value: string) => {
        if (value.length < 3) {
            setAvailable(null);
            return;
        }
        setChecking(true);
        try {
            const res = await usersApi.checkUsernameAvailability(value);
            setAvailable(res.data.success);
        } catch {
            setAvailable(false);
        } finally {
            setChecking(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(val);
        setAvailable(null);
        if (val.length >= 3) {
            const timeout = setTimeout(() => checkAvailability(val), 500);
            return () => clearTimeout(timeout);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!available) return;

        const pendingSignupStr = sessionStorage.getItem('pendingSignup');
        if (!pendingSignupStr) {
            navigate('/signup');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const pendingData = JSON.parse(pendingSignupStr);
            let res;

            if (pendingData.type === 'google') {
                res = await authApi.googleAuth(pendingData.idToken, username);
            } else {
                res = await authApi.signup({
                    fullName: pendingData.fullName,
                    email: pendingData.email,
                    password: pendingData.password,
                    username
                });
            }

            sessionStorage.removeItem('pendingSignup');
            await login(res.data.token);
            navigate('/feed');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Failed to set username');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <img src={LOGO} alt="Add Me" className="mx-auto h-16 w-16 rounded-xl object-cover" />
                    <h1 className="mt-4 text-2xl font-bold">Choose your username</h1>
                    <p className="mt-2 text-muted-foreground">This is how others will find you on Add Me.</p>
                </div>
                <div className="rounded-2xl border bg-card p-8 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                <Input
                                    id="username"
                                    placeholder="your_username"
                                    value={username}
                                    onChange={handleChange}
                                    className="rounded-xl pl-8"
                                    minLength={3}
                                    required
                                />
                                {username.length >= 3 && !checking && available !== null && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {available ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                    </span>
                                )}
                            </div>
                            {checking && <p className="text-xs text-muted-foreground">Checking...</p>}
                            {username.length >= 3 && !checking && available === false && (
                                <p className="text-xs text-red-500">This username is not available</p>
                            )}
                            {username.length >= 3 && !checking && available === true && (
                                <p className="text-xs text-green-500">Username is available!</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full rounded-xl py-5 font-semibold" disabled={loading || !available}>
                            {loading ? 'Setting username...' : 'Continue'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
