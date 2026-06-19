const FEATURES = [
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    label: 'Auto-check websites',
    desc: 'Every 1, 6, 12 or 24 hours',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M2 4h12M2 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    label: 'Instant email alerts',
    desc: 'With page content snapshot',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>,
    label: 'Change history',
    desc: 'Last 10 changes per site',
  },
  {
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2L9.5 6h4.5l-3.5 2.5 1.5 4L8 10l-4 2.5 1.5-4L2 6h4.5L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
    label: 'No login required',
    desc: 'Token-based secure access',
  },
];

const WelcomeModal = ({ onGetStarted }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-7 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#F8F8F8] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-5">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="#111111" strokeWidth="1.5"/>
            <path d="M10 5.5v5l3 2" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-[18px] font-semibold text-[#111111] tracking-tight mb-1">Welcome to Watchly</h2>
        <p className="text-[13px] text-[#737373] mb-6">Monitor any public website for content changes.</p>

        <div className="grid grid-cols-2 gap-2 mb-6 text-left">
          {FEATURES.map((f, i) => (
            <div key={i} className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl px-3 py-2.5">
              <span className="text-[#737373]">{f.icon}</span>
              <p className="text-[12px] font-medium text-[#111111] mt-1.5">{f.label}</p>
              <p className="text-[11px] text-[#737373] mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#F8F8F8] border border-[#E5E5E5] rounded-xl px-4 py-3 mb-5 text-left">
          <p className="text-[11px] font-medium text-[#737373] uppercase tracking-wide mb-1">How it works</p>
          <p className="text-[12px] text-[#737373] leading-relaxed">
            Create an account → get a unique token → add websites to monitor. Your token is your key — keep it safe to access your account anywhere.
          </p>
        </div>

        <button onClick={onGetStarted}
          className="w-full h-10 rounded-xl bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors">
          Get started
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;