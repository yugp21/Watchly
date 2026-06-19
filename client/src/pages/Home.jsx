import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import FilterDropdown from '../components/FilterDropdown';
import MonitorTable from '../components/MonitorTable';
import EmptyState from '../components/EmptyState';
import NewMonitorModal from '../components/NewMonitorModal';
import WelcomeModal from '../components/WelcomeModal';
import StatsBar from '../components/StatsBar';
import TableSkeleton from '../components/TableSkeleton';
import LegalModal from '../components/LegalModal';
import { useSites } from '../hooks/useSites';
import { renameAccount, deleteAccount as deleteAccountApi } from '../services/api';

const loadAccounts = () => {
  try {
    const raw = localStorage.getItem('watchly_accounts');
    if (raw) {
      const parsed = JSON.parse(raw);
      const valid = parsed.every(a => a.localId && a.username && a.token);
      if (valid) return parsed;
    }
  } catch (_) {}
  return [];
};

const saveAccounts = (accs) => localStorage.setItem('watchly_accounts', JSON.stringify(accs));
const loadActiveLocalId = (accounts) => {
  const saved = localStorage.getItem('watchly_active_id');
  if (saved && accounts.find(a => a.localId === saved)) return saved;
  return accounts[0]?.localId || null;
};

const Home = () => {
  const [accounts, setAccounts] = useState(() => loadAccounts());
  const [activeLocalId, setActiveLocalId] = useState(() => loadActiveLocalId(loadAccounts()));
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('watchly_welcomed'));
  const [showNewMonitor, setShowNewMonitor] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toast, setToast] = useState(null);
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy' | null

  const activeAccount = accounts.find(a => a.localId === activeLocalId) || null;

  // Auto-handle invalid/stale credentials
  const handleInvalidCredentials = () => {
    if (!activeAccount) return;
    // Remove the invalid account from localStorage silently
    const updated = accounts.filter(a => a.localId !== activeLocalId);
    setAccounts(updated);
    saveAccounts(updated);
    if (updated.length > 0) {
      setActiveLocalId(updated[0].localId);
      localStorage.setItem('watchly_active_id', updated[0].localId);
    } else {
      setActiveLocalId(null);
      localStorage.removeItem('watchly_active_id');
      localStorage.removeItem('watchly_welcomed');
      setShowWelcome(true);
    }
    showToast('Session expired. Please create or import your account.', 'warning');
  };

  const { sites, loading, error, createSite, removeSite, triggerCheck } =
    useSites(activeAccount?.username, activeAccount?.token, handleInvalidCredentials);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey && e.target.tagName !== 'INPUT' && activeAccount) {
        setShowNewMonitor(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeAccount]);

  const updateAccounts = (updated) => { setAccounts(updated); saveAccounts(updated); };

  const handleSwitch = (localId) => {
    setActiveLocalId(localId);
    localStorage.setItem('watchly_active_id', localId);
  };

  const handleCreated = (acc) => {
    const newAcc = { localId: crypto.randomUUID(), username: acc.username, token: acc.token };
    updateAccounts([...accounts, newAcc]);
    handleSwitch(newAcc.localId);
    localStorage.setItem('watchly_welcomed', '1');
    setShowWelcome(false);
  };

  const handleImported = (acc) => {
    const exists = accounts.find(a => a.username === acc.username);
    if (exists) { handleSwitch(exists.localId); return; }
    const newAcc = { localId: crypto.randomUUID(), username: acc.username, token: acc.token };
    updateAccounts([...accounts, newAcc]);
    handleSwitch(newAcc.localId);
  };

  const handleRename = async (acc, newUsername) => {
    try {
      const res = await renameAccount(acc.username, acc.token, newUsername);
      updateAccounts(accounts.map(a =>
        a.localId === acc.localId ? { ...a, username: res.data.data.username } : a
      ));
      showToast(`Username updated to "${res.data.data.username}"`, 'default');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not rename. Try another username.', 'warning');
    }
  };

  const handleDelete = (acc) => {
    const updated = accounts.filter(a => a.localId !== acc.localId);
    updateAccounts(updated);
    if (activeLocalId === acc.localId && updated.length > 0) handleSwitch(updated[0].localId);
  };

  // Permanently delete account from server + remove locally
  const handleDeleteAccountConfirmed = async (acc) => {
    await deleteAccountApi(acc.username, acc.token);
    const updated = accounts.filter(a => a.localId !== acc.localId);
    updateAccounts(updated);
    if (activeLocalId === acc.localId) {
      if (updated.length > 0) {
        handleSwitch(updated[0].localId);
      } else {
        setActiveLocalId(null);
        localStorage.removeItem('watchly_active_id');
      }
    }
    showToast('Account and all monitors permanently deleted.', 'default');
  };

  const showToast = (msg, type = 'default') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCheck = async (id) => {
    try {
      const result = await triggerCheck(id);
      if (result.unreachable) {
        showToast('Site unreachable — will retry next scheduled check.', 'warning');
      } else {
        showToast(
          result.changed ? 'Change detected — email notification sent.' : 'No changes found.',
          result.changed ? 'warning' : 'default'
        );
      }
    } catch {
      showToast('Check failed. Please try again.', 'warning');
    }
  };

  const filtered = useMemo(() => sites.filter(s => {
    const matchSearch = s.url.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  }), [sites, search, filter]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header
        onNewMonitor={() => {
          if (!activeAccount) showToast('Please create an account first.', 'warning');
          else setShowNewMonitor(true);
        }}
        accounts={accounts}
        activeLocalId={activeLocalId}
        onSwitch={handleSwitch}
        onCreated={handleCreated}
        onImported={handleImported}
        onRename={handleRename}
        onDelete={handleDelete}
        onDeleteAccountConfirmed={handleDeleteAccountConfirmed}
      />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-[#111111]">Monitors</h1>
          <p className="text-[13px] text-[#737373] mt-1">
            {!activeAccount
              ? 'Create or import an account to get started.'
              : sites.length === 0 && !loading
              ? 'No websites being monitored yet.'
              : `${sites.length} website${sites.length !== 1 ? 's' : ''} being monitored`}
          </p>
        </div>

        <StatsBar sites={sites} />

        {sites.length > 0 && !loading && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <FilterDropdown value={filter} onChange={setFilter} />
            <SearchBar value={search} onChange={setSearch} />
          </div>
        )}

        {!activeAccount ? (
          <EmptyState noAccount />
        ) : loading ? (
          <TableSkeleton />
        ) : error ? (
          <div className="rounded-xl border border-[#fecaca] bg-[#FFF5F5] p-4 text-[13px] text-[#EF4444]">{error}</div>
        ) : filtered.length === 0 ? (
          <EmptyState onNewMonitor={() => setShowNewMonitor(true)} />
        ) : (
          <MonitorTable sites={filtered} onDelete={removeSite} onCheckNow={handleCheck} />
        )}
      </main>

      <footer className="border-t border-[#E5E5E5] py-4 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <p className="text-[12px] text-[#737373]">© 2026 Watchly</p>
            <button onClick={() => setLegalModal('terms')} className="text-[12px] text-[#737373] hover:text-[#111111] transition-colors">Terms</button>
            <button onClick={() => setLegalModal('privacy')} className="text-[12px] text-[#737373] hover:text-[#111111] transition-colors">Privacy</button>
          </div>
          <p className="text-[12px] text-[#737373]">
            Press <kbd className="px-1.5 py-0.5 rounded border border-[#E5E5E5] bg-[#F8F8F8] font-mono text-[11px]">N</kbd> to add a monitor
          </p>
        </div>
      </footer>

      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}

      {showNewMonitor && activeAccount && (
        <NewMonitorModal onClose={() => setShowNewMonitor(false)} onSubmit={createSite} />
      )}
      {showWelcome && <WelcomeModal onGetStarted={() => setShowWelcome(false)} />}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl border shadow-lg text-[13px] font-medium z-50 whitespace-nowrap transition-all
          ${toast.type === 'warning'
            ? 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
            : 'bg-[#111111] border-transparent text-white'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default Home;