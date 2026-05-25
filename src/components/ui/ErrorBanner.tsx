interface ErrorBannerProps {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="mx-4 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-center"
      role="alert"
    >
      <p className="text-sm text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 text-sm font-medium text-red-400 underline underline-offset-2 hover:text-red-300 transition-colors"
        >
          重试
        </button>
      )}
    </div>
  )
}
