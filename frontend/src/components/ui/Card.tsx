import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white border border-gray-100 rounded-xl p-4',
        onClick && 'cursor-pointer hover:border-gray-200 hover:shadow-sm transition-all',
        className
      )}
    >
      {children}
    </div>
  );
}
