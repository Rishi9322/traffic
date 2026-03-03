import { useNavigate } from 'react-router-dom';
import ReportForm from '../components/reports/ReportForm.jsx';

/**
 * ReportPage uses absolute inset-0 so the split map+form layout
 * fills the exact remaining viewport (below Navbar) without depending
 * on h-full being propagated through every flex ancestor.
 */
export default function ReportPage() {
    const navigate = useNavigate();
    return (
        <div className="absolute inset-0">
            <ReportForm onClose={() => navigate('/dashboard')} />
        </div>
    );
}
