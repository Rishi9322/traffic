import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = [
    { q: 'How do I report a traffic incident?', a: 'Click "Report Incident" in the sidebar or press the orange button on the dashboard map. Select the incident type, tap your location or use GPS, add a description and optional photo, then submit.' },
    { q: 'How long do reports stay active?', a: 'Reports automatically expire after 6 hours. You can also manually mark your own report as resolved, or admins can do so.' },
    { q: 'Are my reports anonymous?', a: 'You can toggle "Post anonymously" when submitting a report. Anonymous reports show "Anonymous" as the author on the map.' },
    { q: 'How do real-time alerts work?', a: 'When someone reports an incident within 5 km of your location, you\'ll see a toast notification and the report appears on the map instantly via WebSocket.' },
    { q: 'What incident types can I report?', a: 'Accidents 🚨, Traffic Congestion 🚦, Roadblocks 🚧, Waterlogging 💧, and Other ⚠️. You can also set a congestion level: Light, Medium, or Heavy.' },
    { q: 'What does the Heatmap view show?', a: 'The heatmap overlays all active reports weighted by upvotes, showing hotspots of traffic distress on the map.' },
    { q: 'How do I get live traffic layer?', a: 'Toggle "Show Traffic" on the Dashboard map. This overlays Mapbox live traffic data using color-coded roads (green → red).' },
    { q: 'Can I upvote someone else\'s report?', a: 'Yes. Click the 👍 button in the report popup or report card. Upvotes help surface the most actively confirmed incidents.' },
    { q: 'How do I access the Admin Panel?', a: 'If your account has the admin role, you\'ll see "Admin Panel" in the sidebar. Admins can manage reports, users, view audit logs, and read feedback.' },
    { q: 'What happens if a report is flagged?', a: 'Flagged reports are marked and reviewed by admins. They remain visible but are highlighted for review. Malicious reporters can be banned.' },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="glass overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-white font-medium text-sm pr-4">{q}</span>
                {open ? <ChevronUp size={16} className="text-brand-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-navy-400 flex-shrink-0" />}
            </button>
            {open && (
                <div className="px-4 pb-4 border-t border-navy-700/40 pt-3">
                    <p className="text-navy-400 text-sm leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
}

export default function HelpPage() {
    return (
        <div className="max-w-3xl mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-white text-2xl font-bold">Help & FAQ</h1>
                <p className="text-navy-400 mt-1">Answers to common questions about using OSTAS.</p>
            </div>

            <div className="space-y-3">
                {FAQ.map((item) => <FAQItem key={item.q} {...item} />)}
            </div>

            <div className="glass p-6 text-center space-y-2">
                <p className="text-white font-medium">Still have questions?</p>
                <p className="text-navy-400 text-sm">Use the <span className="text-brand-400">Contact Us</span> page to send us a message and we'll help you out.</p>
            </div>
        </div>
    );
}
