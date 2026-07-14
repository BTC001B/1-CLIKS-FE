import { apiClient } from '../api/client';

/**
 * Minimal GST & Tax Service to support CA module compatibility
 */
export const gstService = {
    getGSTR3B: () => apiClient.get('/gst/reports/gstr3b').then(res => res.data.data || res.data),
    fileGstr3b: () => apiClient.post('/gst/filings/gstr3b').then(res => res.data.data || res.data)
};

export default gstService;
