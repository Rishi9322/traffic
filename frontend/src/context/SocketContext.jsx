import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useReportStore } from '../store/reportStore.js';
import { calcDistance } from '../utils/mapHelpers.js';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const socketRef = useRef(null);
    const coordsRef = useRef(null); // Use a ref to avoid re-mounting on geolocation change
    const { addReport, updateReport, removeReport, updateUpvotes } = useReportStore();

    // Get geolocation once into a ref (non-reactive, avoids re-renders)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => { coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
                () => { } // Silent fail — alerts just won't be geo-filtered
            );
        }
    }, []);

    useEffect(() => {
        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
        const socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on('newReport', ({ report }) => {
            addReport(report);

            // Show proximity toast
            const coords = coordsRef.current;
            if (coords) {
                const dist = calcDistance(coords.lat, coords.lng, report.latitude, report.longitude);
                if (dist <= 5) {
                    const typeLabels = {
                        accident: '🚨 Accident',
                        congestion: '🚦 Congestion',
                        roadblock: '🚧 Roadblock',
                        waterlogging: '💧 Waterlogging',
                        other: '⚠️ Incident',
                    };
                    toast(`${typeLabels[report.type] || '⚠️ Incident'} reported nearby!\n${report.locationName || ''}`, {
                        icon: '📍',
                        duration: 6000,
                    });
                }
            } else {
                // No location — show unconditional toast
                toast(`New incident reported: ${report.type}`, { icon: '📍', duration: 4000 });
            }
        });

        socket.on('reportResolved', ({ reportId }) => updateReport(reportId, { status: 'resolved' }));
        socket.on('reportExpired', ({ reportId }) => removeReport(reportId));
        socket.on('reportDeleted', ({ reportId }) => removeReport(reportId));
        socket.on('voteUpdate', ({ reportId, upvotes }) => updateUpvotes(reportId, upvotes));

        return () => socket.disconnect();
    }, []); // Empty deps — connect once, never re-connect

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocketContext = () => useContext(SocketContext);
