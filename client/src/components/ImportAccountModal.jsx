import { useState } from 'react';
import { importAccount } from '../services/api';

const ImportAccountModal = ({ onClose, onImported }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!username.trim() || !token.trim()) { setError('Both fields are required.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await importAccount(username.trim(), token.trim());
      onImported(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">Import Account</h2>
            <p className="text-[13px] text-[#737373] mt-0.5">Enter your username and token to import an existing account.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">Username</label>
            <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-white text-[13px] text-[#111111] placeholder:text-[#B0B0B0] focus:border-[#111111] outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">Token</label>
            <input type="password" placeholder="Enter token" value={token} onChange={(e) => setToken(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-white text-[13px] text-[#111111] placeholder:text-[#B0B0B0] focus:border-[#111111] outline-none transition-colors" />
          </div>
        </div>

        {error && <p className="text-[12px] text-[#EF4444] mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-[#E5E5E5] text-[13px] font-medium text-[#111111] hover:bg-[#F8F8F8] transition-colors">Cancel</button>
          <button onClick={handleImport} disabled={loading} className="flex-1 h-10 rounded-xl bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-50">
            {loading ? 'Importing…' : 'Import Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportAccountModal;