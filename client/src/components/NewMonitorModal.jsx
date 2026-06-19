import { useState } from 'react';

const INTERVALS = [
  { value: 1, label: 'Every hour' },
  { value: 6, label: 'Every 6 hours' },
  { value: 12, label: 'Every 12 hours' },
  { value: 24, label: 'Every 24 hours' },
];

const isValidUrl = (str) => {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
};

const isValidEmail = (str) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);

const NewMonitorModal = ({ onClose, onSubmit }) => {
  const [form, setForm] = useState({ url: '', email: '', checkInterval: 24, label: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async () => {
    setError('');

    if (!form.url.trim() || !form.email.trim()) {
      setError('URL and email are required.');
      return;
    }
    if (!isValidUrl(form.url.trim())) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }
    if (!isValidEmail(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...form,
        url: form.url.trim(),
        email: form.email.trim().toLowerCase(),
        label: form.label.trim(),
        checkInterval: Number(form.checkInterval),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5E5E5] shadow-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[16px] font-semibold text-[#111111]">New monitor</h2>
            <p className="text-[13px] text-[#737373] mt-0.5">Track changes to any public webpage.</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F8F8F8] transition-colors -mt-0.5 -mr-0.5">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Website URL</label>
            <input type="url" placeholder="https://example.com/jobs" value={form.url} onChange={set('url')}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] placeholder:text-[#737373] focus:border-[#111111] focus:bg-white transition-colors outline-none" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#111111] mb-1.5">
              Label <span className="text-[#737373] font-normal">(optional)</span>
            </label>
            <input type="text" placeholder="e.g. SSC Result Page" value={form.label} onChange={set('label')} maxLength={60}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] placeholder:text-[#737373] focus:border-[#111111] focus:bg-white transition-colors outline-none" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Email address</label>
            <input type="email" placeholder="you@email.com" value={form.email} onChange={set('email')}
              className="w-full h-10 px-3 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] placeholder:text-[#737373] focus:border-[#111111] focus:bg-white transition-colors outline-none" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#111111] mb-1.5">Check interval</label>
            <div className="relative">
              <select value={form.checkInterval} onChange={set('checkInterval')}
                className="w-full h-10 pl-3 pr-8 rounded-xl border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] appearance-none cursor-pointer focus:border-[#111111] focus:bg-white transition-colors outline-none">
                {INTERVALS.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none" width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {error && <p className="mt-3 text-[12px] text-[#EF4444]">{error}</p>}

        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 h-9 rounded-xl border border-[#E5E5E5] text-[13px] font-medium text-[#737373] hover:bg-[#F8F8F8] transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 h-9 rounded-xl bg-[#111111] text-white text-[13px] font-medium hover:bg-[#333] transition-colors disabled:opacity-50">
            {loading ? 'Adding…' : 'Start monitoring'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMonitorModal;