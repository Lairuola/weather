import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { FavoritesList } from './FavoritesList'
import { useWeatherStore } from '../../store/weatherStore'

describe('FavoritesList', () => {
  beforeEach(() => {
    useWeatherStore.setState({ favorites: [] })
  })

  it('shows empty hint when no favorites', () => {
    render(<FavoritesList onSelect={vi.fn()} />)
    expect(screen.getByText('搜索城市后点击 ☆ 即可收藏')).toBeDefined()
  })

  it('renders favorite cities', () => {
    useWeatherStore.setState({ favorites: ['北京', '上海'] })
    render(<FavoritesList onSelect={vi.fn()} />)

    expect(screen.getByText('北京')).toBeDefined()
    expect(screen.getByText('上海')).toBeDefined()
  })

  it('calls onSelect when clicking a city', async () => {
    const onSelect = vi.fn()
    useWeatherStore.setState({ favorites: ['北京'] })
    render(<FavoritesList onSelect={onSelect} />)

    await userEvent.click(screen.getByText('北京'))
    expect(onSelect).toHaveBeenCalledWith('北京')
  })

  it('removes city when clicking × button', async () => {
    useWeatherStore.setState({ favorites: ['北京'] })
    render(<FavoritesList onSelect={vi.fn()} />)

    await userEvent.click(screen.getByLabelText('删除 北京'))
    expect(useWeatherStore.getState().favorites).toHaveLength(0)
  })
})
