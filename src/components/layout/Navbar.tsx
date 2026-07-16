import { Link, useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, PlusSquare, Bell, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { LOGO } from '@/utils/constants';

export default function Navbar() {
    const { user } = useAuthStore();
    const { unreadCount } = useNotificationStore();
    const location = useLocation();

    const navItems = [
        { path: '/feed', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/events', icon: CalendarDays, label: 'Events' },
        { path: '/create-post', icon: PlusSquare, label: 'Create' },
        { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
        { path: `/profile/${user?.username || ''}`, icon: User, label: 'Profile' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                <Link to="/feed" className="flex items-center gap-2">
                    <img src={LOGO} alt="Add Me" className="h-10 w-10 rounded-xl object-cover" />
                    <span className="text-xl font-bold tracking-tight">
                        Add <span className="text-primary">Me</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path.startsWith('/profile') && location.pathname.startsWith('/profile'));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-primary/10 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="hidden lg:inline">{item.label}</span>
                                {item.badge ? (
                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile bottom nav */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-background px-2 py-2 md:hidden">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs transition-all ${isActive ? 'text-primary' : 'text-muted-foreground'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                                {item.badge ? (
                                    <span className="absolute -right-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                ) : null}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}

