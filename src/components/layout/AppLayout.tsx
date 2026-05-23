import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Antigravity from '../Antigravity';

export default function AppLayout() {
    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden">
            {/* Interactive WebGL Antigravity Backing Stardust */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -10, pointerEvents: 'none', opacity: 0.35 }}>
                <Antigravity
                    count={250}
                    magnetRadius={8}
                    ringRadius={9}
                    waveSpeed={0.4}
                    waveAmplitude={1.1}
                    particleSize={1.5}
                    lerpSpeed={0.2}
                    color={'#FF9FFC'}
                    autoAnimate={true}
                    particleVariance={0.8}
                />
            </div>

            <Navbar />
            <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 z-10">
                <Sidebar />
                <main className="min-w-0 flex-1">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
}
