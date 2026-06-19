import { useState } from 'react';

const ShareAccountModal = ({ account, onClose }) => {
  const [showToken, setShowToken] = useState(false);
  const [copiedUser, setCopiedUser] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);

  const copy = async (text, setCopied) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">Share Account</h2>
            <p className="text-[13px] text-[#737373] mt-0.5">Copy your username and token to import this account elsewhere.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Username — copyable only */}
          <div>
            <label className="block text-[13px] font-medium text-[#111111] mb-1.5">Username</label>
            <div className="flex items-center gap-2">
              <input readOnly value={account.username}
                className="flex-1 h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] outline-none" />
              <button onClick={() => copy(account.username, setCopiedUser)}
                className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] flex-shrink-0">
                {copiedUser
                  ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 8.5H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h4A1.5 1.5 0 018.5 3v1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Token — fixed, can't be changed */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-[#111111]">Token</label>
              <button onClick={() => setShowTokenInfo(v => !v)}
                className="flex items-center gap-1 text-[11px] text-[#737373] hover:text-[#111111] transition-colors">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/><path d="M5.5 5v3M5.5 3.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Token is fixed
              </button>
            </div>

            {showTokenInfo && (
              <div className="mb-2 px-3 py-2 rounded-lg bg-[#F8F8F8] border border-[#E5E5E5]">
                <p className="text-[12px] text-[#737373] leading-relaxed">
                  Your token is a permanent security key — it cannot be changed. Keep it private. Anyone with your username + token can access your monitors.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input readOnly value={account.token} type={showToken ? 'text' : 'password'}
                className="flex-1 h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] outline-none" />
              <button onClick={() => setShowToken(p => !p)}
                className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] flex-shrink-0">
                {showToken
                  ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5S3.5 2.5 6.5 2.5 11.5 6.5 11.5 6.5 9.5 10.5 6.5 10.5 1.5 6.5 1.5 6.5z" stroke="currentColor" strokeWidth="1.3"/><path d="M2 2L11 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5S3.5 2.5 6.5 2.5 11.5 6.5 11.5 6.5 9.5 10.5 6.5 10.5 1.5 6.5 1.5 6.5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                }
              </button>
              <button onClick={() => copy(account.token, setCopiedToken)}
                className="w-10 h-10 rounded-xl border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] flex-shrink-0">
                {copiedToken
                  ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5l3.5 3.5 5.5-6" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="4.5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 8.5H3a1.5 1.5 0 01-1.5-1.5V3A1.5 1.5 0 013 1.5h4A1.5 1.5 0 018.5 3v1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareAccountModal;