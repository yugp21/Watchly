import { useState } from 'react';
import ManageAccountsModal from './ManageAccountsModal';
import CreateAccountModal from './CreateAccountModal';
import ImportAccountModal from './ImportAccountModal';
import ShareAccountModal from './ShareAccountModal';
import DeleteAccountModal from './DeleteAccountModal';

const Header = ({ onNewMonitor, accounts, activeLocalId, onSwitch, onCreated, onImported, onRename, onDelete, onDeleteAccountConfirmed }) => {
  const [modal, setModal] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const active = accounts.find((a) => a.localId === activeLocalId);

  const handleShare = (acc) => { setShareTarget(acc); setModal('share'); };
  const handleDeleteAccount = (acc) => { setDeleteTarget(acc); setModal('delete-account'); };

  return (
    <>
      <header className="border-b border-[#E5E5E5] bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#111111]" />
            <span className="text-[15px] font-semibold tracking-tight text-[#111111]">Watchly</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={onNewMonitor}
              className="h-8 px-3 sm:px-3.5 rounded-lg bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors">
              <span className="hidden sm:inline">New monitor</span>
              <span className="sm:hidden">+ New</span>
            </button>
            <button onClick={() => setModal('manage')}
              className="h-8 px-2.5 sm:px-3 rounded-full bg-[#F8F8F8] border border-[#E5E5E5] flex items-center gap-1.5 sm:gap-2 hover:bg-[#EFEFEF] transition-colors max-w-[140px] sm:max-w-none">
              <span className="w-2 h-2 rounded-full bg-[#111111] flex-shrink-0" />
              <span className="text-[13px] font-medium text-[#111111] truncate">{active?.username || 'Account'}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-[#737373] flex-shrink-0">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {modal === 'manage' && (
        <ManageAccountsModal accounts={accounts} activeLocalId={activeLocalId}
          onSwitch={onSwitch} onClose={() => setModal(null)}
          onCreateNew={() => setModal('create')}
          onImport={() => setModal('import')}
          onShare={handleShare}
          onDelete={onDelete}
          onRename={onRename}
          onDeleteAccount={handleDeleteAccount}
        />
      )}
      {modal === 'create' && <CreateAccountModal onClose={() => setModal(null)} onCreated={(acc) => { onCreated(acc); setModal(null); }} />}
      {modal === 'import' && <ImportAccountModal onClose={() => setModal(null)} onImported={(acc) => { onImported(acc); setModal(null); }} />}
      {modal === 'share' && shareTarget && <ShareAccountModal account={shareTarget} onClose={() => setModal(null)} />}
      {modal === 'delete-account' && deleteTarget && (
        <DeleteAccountModal
          account={deleteTarget}
          onClose={() => setModal(null)}
          onConfirm={async () => {
            await onDeleteAccountConfirmed(deleteTarget);
            setModal(null);
          }}
        />
      )}
    </>
  );
};

export default Header;