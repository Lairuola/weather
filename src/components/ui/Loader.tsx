export function Loader() {
  return (
    <div className="flex items-center justify-center py-12" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      <span className="sr-only">加载中...</span>
    </div>
  )
}
