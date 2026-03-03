import { create } from 'zustand';

export const useReportStore = create((set) => ({
    reports: [],

    setReports: (reports) => set({ reports }),

    addReport: (report) =>
        set((state) => ({
            reports: [report, ...state.reports.filter((r) => r.id !== report.id)],
        })),

    updateReport: (id, updates) =>
        set((state) => ({
            reports: state.reports.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

    removeReport: (id) =>
        set((state) => ({ reports: state.reports.filter((r) => r.id !== id) })),

    updateUpvotes: (reportId, upvotes) =>
        set((state) => ({
            reports: state.reports.map((r) => (r.id === reportId ? { ...r, upvotes } : r)),
        })),
}));
