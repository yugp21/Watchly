const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
        width="13"
        height="13"
        viewBox="0 0 13 13"
        fill="none"
      >
        <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="Search by URL…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-8 pr-3 rounded-lg border border-[#E5E5E5] bg-[#F8F8F8] text-[13px] text-[#111111] placeholder:text-[#737373] focus:bg-white focus:border-[#111111] transition-colors w-52"
      />
    </div>
  );
};

export default SearchBar;
