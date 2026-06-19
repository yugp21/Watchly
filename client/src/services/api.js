import axios from 'axios';

// Create a common Axios instance for all API requests
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Generate Authorization header using username and token
const authHeader = (username, token) => ({
    headers: {
        Authorization: `Bearer ${username}:${token}`
    }
});

// ==================== Accounts ====================

// Create a new account
export const createAccount = (username, recoveryEmail) =>
    api.post('/accounts/create', { username, recoveryEmail });

// Import an existing account using username and token
export const importAccount = (username, token) =>
    api.post('/accounts/import', { username, token });

// Rename an existing account
export const renameAccount = (username, token, newUsername) =>
    api.patch('/accounts/rename', { username, token, newUsername });

// Delete an account
export const deleteAccount = (username, token) =>
    api.delete('/accounts/delete', {
        data: { username, token }
    });

// ==================== Sites ====================

// Get all monitored sites
export const getSites = (username, token) =>
    api.get('/sites', authHeader(username, token));

// Add a new site for monitoring
export const addSite = (username, token, data) =>
    api.post('/sites', data, authHeader(username, token));

// Delete a site by its ID
export const deleteSite = (id, username, token) =>
    api.delete(`/sites/${id}`, authHeader(username, token));

// Trigger an immediate check for a site
export const checkNow = (id, username, token) =>
    api.post(`/sites/check-now/${id}`, {}, authHeader(username, token));