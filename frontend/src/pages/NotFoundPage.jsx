import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-navy-900 bg-grid flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-sm">
                <div className="text-8xl">🗺️</div>
                <div>
                    <h1 className="text-white text-6xl font-bold mb-2">404</h1>
                    <p className="text-white text-xl font-semibold mb-2">Road Not Found</p>
                    <p className="text-navy-400">Looks like you took a wrong turn. This route doesn't exist on our map.</p>
                </div>
                <Link to="/dashboard" className="btn-primary inline-flex">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
