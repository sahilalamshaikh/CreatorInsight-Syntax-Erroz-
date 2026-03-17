export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">
      {children}
    </div>
  );
}
