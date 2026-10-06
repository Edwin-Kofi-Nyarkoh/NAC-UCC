export default function Loading() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-silver-400 text-sm tracking-wide">Loading…</p>
      </div>
    </div>
  )
}
