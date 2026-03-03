import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import TrafficMap from '../components/map/TrafficMap.jsx';
import ReportList from '../components/reports/ReportList.jsx';
import ReportForm from '../components/reports/ReportForm.jsx';
import { useReports } from '../hooks/useReports.js';
import { Plus, List, X } from 'lucide-react';

export default function DashboardPage() {
    const [showForm, setShowForm] = useState(false);
    const [showList, setShowList] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const { loading } = useReports();

    const location = useLocation();
    const focusLocation = location.state?.focusLocation;

    return (
        <div className="relative h-full w-full overflow-hidden">
            {/* Map fills entire content area */}
            <TrafficMap focusLocation={focusLocation} onReportClick={() => setShowForm(true)} />

            {/* Floating action buttons */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
                <button
                    onClick={() => setShowList(!showList)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg transition-all ${showList ? 'bg-navy-700 text-white' : 'glass text-navy-300 hover:text-white'
                        }`}
                >
                    {showList ? <X size={16} /> : <List size={16} />}
                    {showList ? 'Close List' : 'Show Reports'}
                </button>

                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary px-5 py-3 text-base rounded-xl shadow-2xl shadow-brand-500/30"
                >
                    <Plus size={20} /> Report Incident
                </button>
            </div>

            {/* Report form slide-in drawer */}
            {showForm && (
                <ReportForm
                    onClose={() => { setShowForm(false); setSelectedLocation(null); }}
                    selectedLocation={selectedLocation}
                />
            )}

            {/* Report list slide-in panel from right */}
            {showList && !showForm && (
                <div className="absolute top-0 right-0 h-full w-72 glass-strong border-l border-navy-700/50 z-20 animate-slide-in-right overflow-hidden">
                    <ReportList loading={loading} />
                </div>
            )}
        </div>
    );
}
