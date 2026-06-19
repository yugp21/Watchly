const EmptyState = ({ onNewMonitor, noAccount }) => {
  if (noAccount) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-10 h-10 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] flex items-center justify-center mb-4">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#737373]">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
          </svg>
        </div>
        <h3 className="text-[15px] font-semibold text-[#111111] mb-1.5">No account found</h3>
        <p className="text-[13px] text-[#737373] max-w-xs leading-relaxed">
          Click the account button in the top right to create a new account or import an existing one.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-10 h-10 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] flex items-center justify-center mb-4">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#737373]">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold text-[#111111] mb-1.5">No websites found</h3>
      <p className="text-[13px] text-[#737373] mb-5 max-w-xs leading-relaxed">
        Start monitoring websites to get notified when their content changes.
      </p>
      <button onClick={onNewMonitor}
        className="h-8 px-4 rounded-lg bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors">
        Add your first monitor
      </button>
    </div>
  );
};

export default EmptyState;