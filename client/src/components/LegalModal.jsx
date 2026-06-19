const LegalModal = ({ type, onClose }) => {
  const isTerms = type === 'terms';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E5E5E5] shadow-xl overflow-hidden max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-[#E5E5E5] flex-shrink-0">
          <h2 className="text-[16px] font-semibold text-[#111111]">{isTerms ? 'Terms of Use' : 'Privacy Policy'}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto text-[13px] text-[#737373] leading-relaxed space-y-3">
          {isTerms ? (
            <>
              <p><strong className="text-[#111111]">1. What Watchly does.</strong> Watchly periodically fetches publicly accessible web pages you add and notifies you by email when their content changes.</p>
              <p><strong className="text-[#111111]">2. Acceptable use.</strong> Only monitor pages you have the right to access. Don't use Watchly to monitor pages behind authentication that isn't yours, or to overload third-party servers.</p>
              <p><strong className="text-[#111111]">3. No guarantee of accuracy.</strong> Change detection depends on the target site's structure and availability. Sites that block automated requests or require JavaScript may not be monitorable.</p>
              <p><strong className="text-[#111111]">4. Account & token.</strong> Your account is secured by a token shown once at creation. You are responsible for storing it. Watchly cannot recover a lost token.</p>
              <p><strong className="text-[#111111]">5. Account deletion.</strong> You may permanently delete your account and all associated monitors at any time from the account menu. This action is irreversible.</p>
              <p><strong className="text-[#111111]">6. Service availability.</strong> This is a demo/portfolio-stage service provided as-is, without uptime guarantees.</p>
            </>
          ) : (
            <>
              <p><strong className="text-[#111111]">What we store.</strong> Your username, a hashed version of your token (never plaintext), the URLs you choose to monitor, the notification email you provide per monitor, and a short text snapshot of page content when a change is detected.</p>
              <p><strong className="text-[#111111]">What we don't do.</strong> We don't sell or share your data with third parties. We don't track you across other sites. We don't store your token in a readable form — it's SHA-256 hashed before it ever reaches the database.</p>
              <p><strong className="text-[#111111]">Email delivery.</strong> Change notifications are sent via SMTP. The content of monitored pages may pass through our email provider in order to deliver your alert.</p>
              <p><strong className="text-[#111111]">Data deletion.</strong> Deleting your account immediately and permanently removes your account record and every monitor associated with it from our database.</p>
              <p><strong className="text-[#111111]">Contact.</strong> This is a personal/portfolio project. For questions, reach out via the project's GitHub repository.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalModal;