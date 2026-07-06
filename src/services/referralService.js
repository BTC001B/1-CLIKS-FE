import { apiClient } from '../api/client';

/**
 * Referral Service
 *
 * Covers the full lifecycle:
 *  1. Fetching / generating the user's personal referral code
 *  2. Getting referral stats (how many referred, how many converted, points earned)
 *  3. Submitting a referral code at registration time
 *  4. Validating a referral code before submission
 */
export const referralService = {
    /**
     * Get (or lazily generate) the authenticated user's referral code + link.
     * Backend should be idempotent — return the same code on repeated calls.
     *
     * GET /referrals/my-code
     * Response: { code: string, link: string, stats: { referred: number, converted: number, pointsEarned: number } }
     */
    getMyCode: async () => {
        const res = await apiClient.get('/referrals/my-code');
        return res;
    },

    /**
     * Validate a referral code without applying it.
     * Used to check if a code is valid, not expired, and not a self-referral.
     *
     * POST /referrals/validate
     * Body: { code: string }
     * Response: { valid: boolean, reason?: string }
     */
    validate: async (code) => {
        const res = await apiClient.post('/referrals/validate', { code });
        return res;
    },

    /**
     * Apply a referral code for the newly registered user.
     * Called once, immediately after successful SSO login if a ref param was in the URL.
     * Backend must:
     *  - Reject self-referrals
     *  - Reject duplicate submissions (idempotent)
     *  - Reject expired / invalid codes
     *  - Only credit points after the referred user completes required actions
     *
     * POST /referrals/apply
     * Body: { code: string }
     * Response: { success: boolean, message: string }
     */
    apply: async (code) => {
        const res = await apiClient.post('/referrals/apply', { code });
        return res;
    },

    /**
     * Fetch full referral history for the dashboard.
     *
     * GET /referrals/history
     * Response: Array<{ id, referredUserName, status, pointsAwarded, createdAt }>
     */
    getHistory: async () => {
        const res = await apiClient.get('/referrals/history');
        return res;
    },
};

export default referralService;
