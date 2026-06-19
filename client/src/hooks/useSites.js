import { useState, useEffect, useCallback } from 'react';
import { getSites, addSite, deleteSite, checkNow } from '../services/api';

export const useSites = (username, token, onInvalidCredentials) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleError = (err) => {
    const status = err.response?.status;
    // If 401 — credentials are invalid/stale, auto-clear and reset
    if (status === 401) {
      console.warn('[useSites] Invalid credentials — clearing account');
      if (onInvalidCredentials) onInvalidCredentials();
      return;
    }
    setError(err.response?.data?.message || 'Failed to load monitors.');
  };

  const fetchSites = useCallback(async () => {
    if (!username || !token) { setLoading(false); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await getSites(username, token);
      setSites(res.data.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [username, token]);

  useEffect(() => { fetchSites(); }, [fetchSites]);

  const createSite = async (data) => {
    const res = await addSite(username, token, data);
    setSites((prev) => [res.data.data, ...prev]);
    return res.data.data;
  };

  const removeSite = async (id) => {
    await deleteSite(id, username, token);
    setSites((prev) => prev.filter((s) => s._id !== id));
  };

  const triggerCheck = async (id) => {
    const res = await checkNow(id, username, token);
    setSites((prev) => prev.map((s) => (s._id === id ? res.data.data : s)));
    return res.data;
  };

  return { sites, loading, error, fetchSites, createSite, removeSite, triggerCheck };
};