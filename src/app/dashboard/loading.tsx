export default function DashboardLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Greeting skeleton */}
      <div>
        <div className="h-6 w-40 rounded-lg bg-zinc-200" />
        <div className="h-4 w-28 rounded-lg bg-zinc-100 mt-2" />
      </div>

      {/* Business pills skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-24 rounded-full bg-zinc-200" />
        <div className="h-8 w-20 rounded-full bg-zinc-100" />
      </div>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 h-20" />
        <div className="rounded-xl border border-zinc-200 bg-white p-4 h-20" />
      </div>

      {/* Scan button skeleton */}
      <div className="h-14 rounded-2xl bg-zinc-200" />

      {/* Transaction list skeleton */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-zinc-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
