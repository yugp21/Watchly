import { useState } from 'react';

const ManageAccountsModal = ({ accounts, activeLocalId, onSwitch, onClose, onCreateNew, onImport, onShare, onDelete, onRename, onDeleteAccount }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const startEdit = (acc, e) => {
    e.stopPropagation();
    setEditingId(acc.localId);
    setEditName(acc.username);
  };

  const submitEdit = async (acc) => {
    if (editName.trim() && editName.trim() !== acc.username) {
      await onRename(acc, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl overflow-hidden">
        <div className="flex items-start justify-between px-5 pt-5 pb-1">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">Manage Accounts</h2>
            <p className="text-[13px] text-[#737373] mt-0.5">Switch between accounts or manage your accounts.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="px-4 py-3 space-y-1.5">
          {accounts.map((acc) => (
            <div key={acc.localId}
              onClick={() => { onSwitch(acc.localId); onClose(); }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${acc.localId === activeLocalId ? 'bg-[#F8F8F8] border border-[#E5E5E5]' : 'hover:bg-[#F8F8F8]'}`}>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${acc.localId === activeLocalId ? 'bg-[#111111]' : 'border-2 border-[#D4D4D4]'}`} />
                {editingId === acc.localId ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => submitEdit(acc)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitEdit(acc); if (e.key === 'Escape') setEditingId(null); }}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[13px] font-medium text-[#111111] bg-transparent border-b border-[#111111] outline-none flex-1 min-w-0"
                  />
                ) : (
                  <span className="text-[13px] font-medium text-[#111111] truncate">{acc.username}</span>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={(e) => startEdit(acc, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#EFEFEF]" title="Rename">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                </button>
                {accounts.length > 1 && (
                  <button onClick={() => onDelete(acc)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:text-[#EF4444] hover:bg-[#FFF5F5]" title="Delete">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 3h10M4 3V2h4v1M5 5v4M7 5v4M2 3l.5 7.5h7L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[#E5E5E5] mx-4" />

        <div className="px-4 py-3 space-y-1.5">
          <button onClick={onCreateNew}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F8F8F8] transition-colors text-left">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <span className="text-[13px] font-medium text-[#111111]">Create New Account</span>
          </button>
          <button onClick={onImport}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F8F8F8] transition-colors text-left">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3.5 5.5L6 8l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 9.5v1h10v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <span className="text-[13px] font-medium text-[#111111]">Import Account</span>
          </button>
          <button onClick={() => { const active = accounts.find(a => a.localId === activeLocalId); if (active) onShare(active); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#E5E5E5] hover:bg-[#F8F8F8] transition-colors text-left">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 1.5L10.5 3 9 4.5M1.5 6A4.5 4.5 0 016 1.5h4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M1 9.5v1h10v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <span className="text-[13px] font-medium text-[#111111]">Share Account</span>
          </button>
          {onDeleteAccount && (
            <button onClick={() => { const active = accounts.find(a => a.localId === activeLocalId); if (active) onDeleteAccount(active); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[#FECACA] hover:bg-[#FEF2F2] transition-colors text-left">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4.5 3V2h3v1M5 5v3.5M7 5v3.5M2.5 3l.5 6.5h6L9.5 3" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-[13px] font-medium text-[#EF4444]">Delete account permanently</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAccountsModal;