const FilterDropdown = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-3 pr-7 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] appearance-none cursor-pointer focus:bg-white focus:border-[#111111] transition-colors"
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="changed">Changed</option>
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
      >
        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

export default FilterDropdown;
