import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ReportPage from './pages/ReportPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import HelpPage from './pages/HelpPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Route guard: redirect to /login if not authenticated
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
    return user ? children : <Navigate to="/login" replace />;
}

// Route guard: redirect to /dashboard if not admin
function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    return user.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes — wrapped in DashboardLayout */}
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="report" element={<ReportPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="help" element={<HelpPage />} />

                {/* Admin-only route */}
                <Route path="admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
