import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const PAGE_TITLES = {
    '/dashboard': 'Live Traffic Map',
    '/report': 'Report Incident',
    '/admin': 'Admin Panel',
    '/contact': 'Contact Us',
    '/about': 'About OSTAS',
    '/help': 'Help & FAQ',
};

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const location = useLocation();
    const title = PAGE_TITLES[location.pathname] || 'OSTAS';

    return (
        <div className="flex h-screen overflow-hidden bg-navy-900">
            {/* Sidebar */}
            <div className={`hidden md:flex h-full flex-shrink-0`}>
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </div>

            {/* Mobile overlay sidebar */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setMobileSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full">
                        <Sidebar collapsed={false} setCollapsed={() => { }} />
                    </div>
                </div>
            )}

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar title={title} onMenuClick={() => setMobileSidebarOpen(true)} />
                <main className="flex-1 overflow-hidden relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
