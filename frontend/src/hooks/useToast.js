import toast from 'react-hot-toast';
import { useCallback } from 'react';

export function useToast() {
    const success = useCallback((msg) => toast.success(msg), []);
    const error = useCallback((msg) => toast.error(msg), []);
    const info = useCallback((msg) => toast(msg, { icon: 'ℹ️' }), []);
    const warning = useCallback((msg) => toast(msg, { icon: '⚠️' }), []);
    return { success, error, info, warning };
}
