import { useState } from 'react';

const DeleteAccountModal = ({ account, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canDelete = confirmText.trim() === account.username;

  const handleDelete = async () => {
    if (!canDelete) return;
    setLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete account.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-5">
        <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mb-3">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5.5 4V2.5h5V4M6.5 7v4M9.5 7v4M3.5 4l.7 8.5a1.5 1.5 0 001.5 1.5h4.6a1.5 1.5 0 001.5-1.5L12.5 4" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-[15px] font-semibold text-[#111111]">Delete account permanently</h2>
        <p className="text-[13px] text-[#737373] mt-1 leading-relaxed">
          This will permanently delete <strong>{account.username}</strong> and all its monitors. This action <strong>cannot be undone</strong>.
        </p>

        <div className="mt-4">
          <label className="block text-[12px] font-medium text-[#111111] mb-1.5">
            Type <span className="font-mono bg-[#F8F8F8] px-1 py-0.5 rounded">{account.username}</span> to confirm
          </label>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={account.username}
            className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] focus:border-[#EF4444] focus:bg-white outline-none transition-colors"
          />
        </div>

        {error && <p className="text-[12px] text-[#EF4444] mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-[#E5E5E5] text-[13px] font-medium text-[#111111] hover:bg-[#F8F8F8] transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={!canDelete || loading}
            className="flex-1 h-10 rounded-xl bg-[#EF4444] text-white text-[13px] font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;