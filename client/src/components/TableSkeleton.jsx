const SkeletonRow = () => (
  <tr className="border-b border-[#E5E5E5]">
    <td className="px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-md bg-[#F0F0F0] animate-pulse flex-shrink-0" />
        <div>
          <div className="h-3.5 w-28 bg-[#F0F0F0] rounded animate-pulse mb-1.5" />
          <div className="h-2.5 w-40 bg-[#F0F0F0] rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-4 py-3">
      <div className="h-5 w-14 bg-[#F0F0F0] rounded-md animate-pulse" />
    </td>
    <td className="px-4 py-3 hidden sm:table-cell">
      <div className="h-3.5 w-16 bg-[#F0F0F0] rounded animate-pulse" />
    </td>
    <td className="px-4 py-3 hidden md:table-cell">
      <div className="h-3.5 w-14 bg-[#F0F0F0] rounded animate-pulse" />
    </td>
    <td className="px-4 py-3 hidden md:table-cell">
      <div className="h-3.5 w-8 bg-[#F0F0F0] rounded animate-pulse" />
    </td>
    <td className="px-4 py-3">
      <div className="flex gap-1">
        <div className="w-7 h-7 rounded-md bg-[#F0F0F0] animate-pulse" />
        <div className="w-7 h-7 rounded-md bg-[#F0F0F0] animate-pulse" />
        <div className="w-7 h-7 rounded-md bg-[#F0F0F0] animate-pulse" />
      </div>
    </td>
  </tr>
);

const TableSkeleton = () => (
  <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
    <table className="w-full table-fixed">
      <thead>
        <tr className="border-b border-[#E5E5E5] bg-[#F8F8F8]">
          <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider">Website</th>
          <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-24">Status</th>
          <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-28 hidden sm:table-cell">Last Checked</th>
          <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-24 hidden md:table-cell">Interval</th>
          <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-20 hidden md:table-cell">Checks</th>
          <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-28">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-[#E5E5E5]">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </tbody>
    </table>
  </div>
);

export default TableSkeleton;