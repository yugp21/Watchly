import { useState } from 'react';
import { createAccount } from '../services/api';

const CreateAccountModal = ({ onClose, onCreated }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createAccount(username.trim());
      setCreated(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, setCopied) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    if (!confirmed) return;
    onCreated(created);
    onClose();
  };

  if (created) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
        <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-5">
          {/* Header */}
          <div className="mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#FEF9C3] border border-[#FDE68A] flex items-center justify-center mb-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 3.5v3M8 10.5v.5" stroke="#B45309" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="text-[15px] font-semibold text-[#111111]">Save your credentials</h2>
            <p className="text-[13px] text-[#737373] mt-1 leading-relaxed">
              Your token is shown <strong>only once</strong>. Copy and save it somewhere safe — you'll need it to access your account on another device.
            </p>
          </div>

          <div className="space-y-3 mb-4">
            {/* Username */}
            <div>
              <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wide mb-1.5">Username</label>
              <div className="flex items-center gap-2">
                <input readOnly value={created.username}
                  className="flex-1 h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] outline-none" />
                <button onClick={() => copy(created.username, setCopiedUser)}
                  className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] flex-shrink-0">
                  {copiedUser
                    ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 8.5H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h4A1.5 1.5 0 018.5 3v1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Token */}
            <div>
              <label className="block text-[11px] font-medium text-[#737373] uppercase tracking-wide mb-1.5">Token <span className="text-[#EF4444]">— save this now</span></label>
              <div className="flex items-center gap-2">
                <input readOnly value={created.token} type={showToken ? 'text' : 'password'}
                  className="flex-1 h-10 px-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] text-[13px] text-[#111111] outline-none" />
                <button onClick={() => setShowToken(p => !p)}
                  className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] flex-shrink-0">
                  {showToken
                    ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5S3.5 2.5 6.5 2.5 11.5 6.5 11.5 6.5 9.5 10.5 6.5 10.5 1.5 6.5 1.5 6.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M2 2L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5S3.5 2.5 6.5 2.5 11.5 6.5 11.5 6.5 9.5 10.5 6.5 10.5 1.5 6.5 1.5 6.5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                  }
                </button>
                <button onClick={() => copy(created.token, setCopiedToken)}
                  className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] flex-shrink-0">
                  {copiedToken
                    ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 8.5H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h4A1.5 1.5 0 018.5 3v1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer mb-4 p-3 rounded-xl border border-[#E5E5E5] hover:bg-[#F8F8F8] transition-colors">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
              className="mt-0.5 accent-black flex-shrink-0" />
            <span className="text-[12px] text-[#737373] leading-relaxed">
              I have saved my username and token. I understand I cannot recover my account without them.
            </span>
          </label>

          <button onClick={handleDone} disabled={!confirmed}
            className="w-full h-10 rounded-xl bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            I've saved my credentials — continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">Create New Account</h2>
            <p className="text-[13px] text-[#737373] mt-0.5">Leave empty for a random username.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <label className="block text-[13px] font-medium text-[#111111] mb-1.5">Username</label>
        <input type="text" placeholder="Optional (auto-generated if empty)"
          value={username} onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] placeholder:text-[#B0B0B0] focus:border-[#111111] focus:bg-white outline-none transition-colors mb-4" />

        {error && <p className="text-[12px] text-[#EF4444] mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-[#E5E5E5] text-[13px] font-medium text-[#111111] hover:bg-[#F8F8F8] transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={loading}
            className="flex-1 h-10 rounded-xl bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-50">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountModal;