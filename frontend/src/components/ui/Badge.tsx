interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}

export default function Badge({ children, color = '#534AB7', bg = '#EEEDFE' }: BadgeProps) {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ color, background: bg }}
    >
      {children}
    </span>
  );
}
