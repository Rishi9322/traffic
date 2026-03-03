import { useState, useCallback } from 'react';
import { reportApi } from '../api/reportApi.js';
import { useReportStore } from '../store/reportStore.js';

export function useReports() {
    const { reports, setReports, addReport, updateReport, removeReport } = useReportStore();
    const [loading, setLoading] = useState(false);

    const fetchReports = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const { data } = await reportApi.getReports(params);
            setReports(data.data);
        } finally {
            setLoading(false);
        }
    }, [setReports]);

    const createReport = useCallback(async (formData) => {
        const { data } = await reportApi.createReport(formData);
        return data;
    }, []);

    const deleteReport = useCallback(async (id) => {
        await reportApi.deleteReport(id);
        removeReport(id);
    }, [removeReport]);

    const resolveReport = useCallback(async (id) => {
        await reportApi.resolveReport(id);
        updateReport(id, { status: 'resolved' });
    }, [updateReport]);

    const toggleUpvote = useCallback(async (id) => {
        const { data } = await reportApi.toggleUpvote(id);
        return data;
    }, []);

    return { reports, loading, fetchReports, createReport, deleteReport, resolveReport, toggleUpvote };
}
