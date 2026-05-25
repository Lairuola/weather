import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('calls onSearch with trimmed input on submit', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} disabled={false} />)

    const input = screen.getByLabelText('城市名称')
    await userEvent.type(input, '  北京  ')
    await userEvent.click(screen.getByLabelText('搜索'))

    expect(onSearch).toHaveBeenCalledWith('北京')
  })

  it('blocks empty input submission', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} disabled={false} />)

    await userEvent.click(screen.getByLabelText('搜索'))
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('disables input and button when disabled', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} disabled={true} />)

    const input = screen.getByLabelText('城市名称')
    expect(input).toBeDisabled()
  })

  it('clears input after submit', async () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} disabled={false} />)

    const input = screen.getByLabelText('城市名称')
    await userEvent.type(input, '北京')
    await userEvent.click(screen.getByLabelText('搜索'))

    expect(onSearch).toHaveBeenCalledWith('北京')
    // Input keeps its value until user clears it
  })
})
