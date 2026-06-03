import { useLocation } from 'react-router-dom';
import { Home, Search, CalendarDays, PlusSquare, Bell, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import GlassIcons from '@/components/GlassIcons';

export default function Sidebar() {
    const { user } = useAuthStore();
    const location = useLocation();

    const links = [
        { path: '/feed',                            icon: <Home className="h-5 w-5" />,         label: 'Home',          color: 'blue'    },
        { path: '/search',                          icon: <Search className="h-5 w-5" />,       label: 'Search',        color: 'indigo'  },
        { path: '/events',                          icon: <CalendarDays className="h-5 w-5" />, label: 'Events',        color: 'purple'  },
        { path: '/create-post',                     icon: <PlusSquare className="h-5 w-5" />,   label: 'Create Post',   color: 'green'   },
        { path: '/notifications',                   icon: <Bell className="h-5 w-5" />,         label: 'Notifications', color: 'orange'  },
        { path: `/profile/${user?.username || ''}`, icon: <User className="h-5 w-5" />,         label: 'My Profile',    color: 'pink'    },
        { path: '/profile/edit',                    icon: <Settings className="h-5 w-5" />,     label: 'Edit Profile',  color: 'teal'    },
    ];

    return (
        <aside className="sticky top-20 hidden h-fit w-20 flex-shrink-0 lg:block">
            <nav className="flex flex-col items-center gap-1 rounded-2xl border bg-card/80 backdrop-blur-sm p-4 shadow-sm overflow-visible">
                <GlassIcons
                    items={links.map(link => ({
                        icon: link.icon,
                        color: location.pathname === link.path ? 'primary' : link.color,
                        label: link.label,
                        onClick: () => { window.location.href = link.path; },
                        customClass: location.pathname === link.path ? 'opacity-100' : 'opacity-80 hover:opacity-100',
                    }))}
                />
            </nav>
        </aside>
    );
}
