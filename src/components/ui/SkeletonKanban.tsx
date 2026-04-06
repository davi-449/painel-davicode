

export function SkeletonKanban({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex gap-4 h-[calc(100vh-140px)] overflow-hidden">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80 bg-white/[0.02] border border-white/[0.06] rounded-2xl flex flex-col pt-4">
          <div className="px-4 pb-4 border-b border-white/[0.06] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full skeleton"></div>
            <div className="w-24 h-5 rounded skeleton"></div>
            <div className="w-6 h-5 rounded-full skeleton ml-auto"></div>
          </div>
          <div className="flex-1 p-3 space-y-3 overflow-hidden">
            {/* 3 placeholder cards per column */}
            {[1, 2, 3].map(j => (
              <div key={j} className="glass-card p-4 rounded-lg flex flex-col gap-3 opacity-50">
                <div className="w-3/4 h-5 rounded skeleton"></div>
                <div className="w-1/2 h-4 rounded skeleton"></div>
                <div className="border-t border-white/[0.06] pt-3 mt-1 flex justify-between">
                  <div className="w-16 h-4 rounded skeleton"></div>
                  <div className="w-12 h-4 rounded skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
