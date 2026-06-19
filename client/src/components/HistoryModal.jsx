import { createPortal } from 'react-dom';

const formatDate = (date) => new Date(date).toLocaleString('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

const HistoryModal = ({ site, onClose }) => {
  const hostname = (() => {
    try { return new URL(site.url).hostname.replace(/^www\./, ''); }
    catch { return site.url; }
  })();

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="text-[15px] font-semibold text-[#111111]">Change History</h2>
            <p className="text-[12px] text-[#737373] mt-0.5">{hostname}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-px bg-[#E5E5E5] border-b border-[#E5E5E5]">
          {[
            { label: 'Total Checks', value: site.totalChecks ?? 0 },
            { label: 'Changes', value: site.totalChanges ?? 0 },
            { label: 'Interval', value: `${site.checkInterval}h` },
          ].map((s) => (
            <div key={s.label} className="bg-white px-4 py-3 text-center">
              <p className="text-[16px] font-semibold text-[#111111]">{s.value}</p>
              <p className="text-[10px] text-[#737373] mt-0.5 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="max-h-80 overflow-y-auto">
          {!site.changeHistory || site.changeHistory.length === 0 ? (
            <div className="text-center py-10 px-5">
              <div className="w-8 h-8 rounded-full bg-[#F8F8F8] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-3">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#737373" strokeWidth="1.3"/><path d="M7 4.5v3l2 1" stroke="#737373" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              <p className="text-[13px] font-medium text-[#111111]">No changes yet</p>
              <p className="text-[12px] text-[#737373] mt-1">Changes will appear here when detected.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {site.changeHistory.map((event, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span className="text-[13px] font-medium text-[#111111]">Content changed</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-[#737373]">{formatDate(event.detectedAt)}</p>
                      {event.emailSent && (
                        <p className="text-[10px] text-[#22C55E] mt-0.5 flex items-center justify-end gap-1">
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          Email sent
                        </p>
                      )}
                    </div>
                  </div>
                  {event.snapshot && (
                    <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-3 py-2.5 mt-2">
                      <p className="text-[10px] font-medium text-[#737373] uppercase tracking-wide mb-1.5">Page snapshot</p>
                      <p className="text-[12px] text-[#111111] leading-relaxed line-clamp-4">{event.snapshot}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default HistoryModal;