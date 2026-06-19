const STATUS_CONFIG = {
  active: { label: 'Active', dot: 'bg-[#22C55E]', text: 'text-[#15803d]', bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]' },
  changed: { label: 'Changed', dot: 'bg-[#F59E0B]', text: 'text-[#b45309]', bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]' },
  unreachable: { label: 'Unreachable', dot: 'bg-[#EF4444]', text: 'text-[#b91c1c]', bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-medium border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default StatusBadge;