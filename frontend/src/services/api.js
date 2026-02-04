/**
 * API Client Service
 * 
 * Handles all communication with the backend.
 * Includes JWT token injection for secured routes.
 */

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('pos_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    if (response.status === 401) {
        // Session expired or unauthorized
        localStorage.removeItem('pos_token');
        if (!window.location.pathname.includes('/login')) {
            window.location.reload(); // Force re-auth
        }
    }

    const data = await response.json();
    if (!response.ok) {
        const error = (data && data.message) || response.statusText;
        return Promise.reject(error);
    }
    return data;
};

export const api = {
    // --- Authentication ---
    async login(username, password) {
        const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        return handleResponse(res);
    },

    async register(userData) {
        const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        return handleResponse(res);
    },

    // --- Transactions ---
    async listTransactions(page = 1, perPage = 20) {
        const res = await fetch(`${API_BASE}/api/v1/transactions?page=${page}&per_page=${perPage}`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async createPayment(paymentData) {
        const res = await fetch(`${API_BASE}/api/v1/transactions/pay`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(paymentData),
        });
        return handleResponse(res);
    },

    async getTransaction(id) {
        const res = await fetch(`${API_BASE}/api/v1/transactions/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    async refundTransaction(id, amount, reason) {
        const res = await fetch(`${API_BASE}/api/v1/transactions/${id}/refund`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount, reason }),
        });
        return handleResponse(res);
    },

    // --- Payment Links ---
    async createPaymentLink(linkData) {
        const res = await fetch(`${API_BASE}/api/v1/payment-links`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(linkData),
        });
        return handleResponse(res);
    },

    async getPaymentLink(id) {
        const res = await fetch(`${API_BASE}/api/v1/payment-links/${id}`, {
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    // --- Receipts ---
    async generateReceipt(receiptData) {
        const res = await fetch(`${API_BASE}/api/v1/receipts`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(receiptData),
        });
        return handleResponse(res);
    },

    // --- Health ---
    async checkHealth() {
        const res = await fetch(`${API_BASE}/api/v1/health`);
        return handleResponse(res);
    }
};
