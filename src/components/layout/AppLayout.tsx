import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
                <Sidebar />
                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
}
