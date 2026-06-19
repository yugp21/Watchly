import { useState } from 'react';
import StatusBadge from './StatusBadge';
import HistoryModal from './HistoryModal';

const formatRelative = (date) => {
  if (!date) return '—';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const Favicon = ({ url }) => {
  const [failed, setFailed] = useState(false);
  const hostname = (() => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return '?'; } })();
  const faviconUrl = (() => { try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return null; } })();

  if (failed || !faviconUrl) {
    return (
      <div className="w-6 h-6 rounded-md bg-[#F8F8F8] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-semibold text-[#737373]">{hostname.charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-md bg-[#F8F8F8] border border-[#E5E5E5] flex items-center justify-center flex-shrink-0 overflow-hidden">
      <img src={faviconUrl} alt="" className="w-4 h-4 object-contain" onError={() => setFailed(true)} />
    </div>
  );
};

const MonitorRow = ({ site, onDelete, onCheckNow }) => {
  const [checking, setChecking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const hostname = (() => { try { return new URL(site.url).hostname.replace(/^www\./, ''); } catch { return site.url; } })();
  const displayName = site.label || hostname;

  const handleCheck = async () => {
    setChecking(true);
    try { await onCheckNow(site._id); } finally { setChecking(false); }
  };

  return (
    <>
      <tr className="group border-b border-[#E5E5E5] hover:bg-[#F8F8F8] transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Favicon url={site.url} />
            <div className="min-w-0">
              <a href={site.url} target="_blank" rel="noopener noreferrer"
                className="text-[13px] font-medium text-[#111111] hover:underline block truncate">
                {displayName}
              </a>
              <p className="text-[11px] text-[#737373] truncate hidden sm:block">{site.url}</p>
            </div>
          </div>
        </td>

        <td className="px-4 py-3"><StatusBadge status={site.status} /></td>

        <td className="px-4 py-3 hidden sm:table-cell">
          <span className="text-[13px] text-[#737373]">{formatRelative(site.lastChecked)}</span>
        </td>

        <td className="px-4 py-3 hidden md:table-cell">
          <span className="text-[13px] text-[#737373]">Every {site.checkInterval}h</span>
        </td>

        <td className="px-4 py-3 hidden md:table-cell">
          <div className="flex items-center gap-1">
            <span className="text-[13px] text-[#737373]">{site.totalChecks ?? 0}</span>
            {(site.totalChanges ?? 0) > 0 && <span className="text-[11px] text-[#F59E0B] font-medium">· {site.totalChanges}↑</span>}
          </div>
        </td>

        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setShowHistory(true)} title="History"
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#737373] hover:text-[#111111] hover:bg-[#EFEFEF] transition-colors">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 4v3l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleCheck} disabled={checking} title="Check now"
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#737373] hover:text-[#111111] hover:bg-[#EFEFEF] transition-colors disabled:opacity-40">
              {checking
                ? <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20" strokeDashoffset="8"/></svg>
                : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M11 2v3H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 5A5 5 0 1 0 9.5 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              }
            </button>
            <button onClick={() => onDelete(site._id)} title="Delete"
              className="w-7 h-7 rounded-md flex items-center justify-center text-[#737373] hover:text-[#EF4444] hover:bg-[#FFF5F5] transition-colors">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3.5h10M4.5 3.5V2.5h4v1M5.5 6v4M7.5 6v4M2.5 3.5l.5 7.5h7l.5-7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </td>
      </tr>
      {showHistory && <HistoryModal site={site} onClose={() => setShowHistory(false)} />}
    </>
  );
};

export default MonitorRow;