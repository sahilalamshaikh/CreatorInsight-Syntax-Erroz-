interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean | null;
  color?: string;
  onClick?: () => void;
}

export default function StatCard({ label, value, delta, deltaUp, color = '#534AB7', onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-50 rounded-xl p-4 ${onClick ? 'cursor-pointer hover:bg-white hover:shadow-sm transition-all' : ''}`}
    >
      <div className="text-[11px] text-gray-500 mb-1">{label}</div>
      <div className="text-[22px] font-medium mb-1" style={{ color }}>{value}</div>
      {delta && (
        <div className={`text-[11px] flex items-center gap-1
          ${deltaUp === true ? 'text-emerald-600' : deltaUp === false ? 'text-red-500' : 'text-gray-400'}`}>
          {deltaUp === true ? '↑' : deltaUp === false ? '↓' : ''} {delta}
        </div>
      )}
    </div>
  );
}
