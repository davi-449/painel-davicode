import { cn } from '../../lib/utils';

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("glass-card p-6 rounded-xl relative overflow-hidden", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-24 h-4 rounded-md skeleton"></div>
        <div className="w-8 h-8 rounded-lg skeleton"></div>
      </div>
      <div className="w-32 h-10 rounded-lg skeleton mb-2"></div>
      <div className="w-48 h-3 rounded-md skeleton mt-4"></div>
    </div>
  );
}
