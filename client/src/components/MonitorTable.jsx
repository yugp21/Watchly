import MonitorRow from './MonitorRow';

const MonitorTable = ({ sites, onDelete, onCheckNow }) => {
  return (
    <div className="border border-[#E5E5E5] rounded-xl overflow-hidden">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-[#E5E5E5] bg-[#F8F8F8]">
            <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-auto">Website</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-24">Status</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-28 hidden sm:table-cell">Last Checked</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-24 hidden md:table-cell">Interval</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-20 hidden md:table-cell">Checks</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#737373] uppercase tracking-wider w-28">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#E5E5E5]">
          {sites.map((site) => (
            <MonitorRow key={site._id} site={site} onDelete={onDelete} onCheckNow={onCheckNow} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonitorTable;