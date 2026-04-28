interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`border border-[#EEE] rounded-lg p-4 bg-white ${className}`}>
      {children}
    </div>
  );
}
