const StatsBar = ({ sites }) => {
  const totalChecks = sites.reduce((sum, s) => sum + (s.totalChecks || 0), 0);
  const active = sites.filter(s => s.status === 'active').length;
  const changed = sites.filter(s => s.status === 'changed').length;

  if (sites.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
      {[
        { label: 'Monitors', value: sites.length, color: 'text-[#111111]' },
        { label: 'Active', value: active, color: 'text-[#15803d]' },
        { label: 'Changed', value: changed, color: 'text-[#b45309]' },
        { label: 'Total Checks', value: totalChecks, color: 'text-[#111111]' },
      ].map((stat) => (
        <div key={stat.label} className="border border-[#E5E5E5] rounded-xl px-3 sm:px-4 py-3 bg-[#F8F8F8]">
          <p className={`text-[18px] sm:text-[20px] font-semibold ${stat.color}`}>{stat.value}</p>
          <p className="text-[10px] sm:text-[11px] text-[#737373] mt-0.5 uppercase tracking-wide">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;