import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ErrorBanner } from './ErrorBanner'

describe('ErrorBanner', () => {
  it('renders error message', () => {
    render(<ErrorBanner message="网络异常" />)
    expect(screen.getByText('网络异常')).toBeDefined()
  })

  it('renders retry button when onRetry provided', () => {
    render(<ErrorBanner message="网络异常" onRetry={vi.fn()} />)
    expect(screen.getByText('重试')).toBeDefined()
  })

  it('calls onRetry when retry button clicked', async () => {
    const onRetry = vi.fn()
    render(<ErrorBanner message="网络异常" onRetry={onRetry} />)

    await userEvent.click(screen.getByText('重试'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not render retry button when onRetry not provided', () => {
    render(<ErrorBanner message="网络异常" />)
    expect(screen.queryByText('重试')).toBeNull()
  })
})
