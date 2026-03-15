import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="mt-auto border-t bg-card">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                            Add <span className="text-primary">Me</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Copyright {new Date().getFullYear()} All rights reserved.
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <a
                            href="mailto:varun.tripathi2004@gmail.com"
                            className="transition-colors hover:text-primary"
                        >
                            Contact Us
                        </a>
                        <a
                            href="mailto:varun.tripathi2004@gmail.com"
                            className="transition-colors hover:text-primary"
                        >
                            Support
                        </a>
                        <Link to="/privacy" className="transition-colors hover:text-primary">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
