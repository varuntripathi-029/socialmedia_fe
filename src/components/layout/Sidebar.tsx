import { Link, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, PlusSquare, Bell, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
    const { user } = useAuthStore();
    const location = useLocation();

    const links = [
        { path: '/feed', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/events', icon: CalendarDays, label: 'Events' },
        { path: '/create-post', icon: PlusSquare, label: 'Create Post' },
        { path: '/notifications', icon: Bell, label: 'Notifications' },
        { path: `/profile/${user?.username || ''}`, icon: User, label: 'My Profile' },
        { path: '/profile/edit', icon: Settings, label: 'Edit Profile' },
    ];

    return (
        <aside className="sticky top-20 hidden h-fit w-56 flex-shrink-0 lg:block">
            <nav className="flex flex-col gap-1 rounded-2xl border bg-card p-3 shadow-sm">
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:bg-primary/10 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                }`}
                        >
                            <link.icon className="h-5 w-5" />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
