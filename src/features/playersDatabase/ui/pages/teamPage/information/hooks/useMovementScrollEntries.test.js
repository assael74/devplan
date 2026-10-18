// src/features/playersDatabase/ui/pages/teamPage/information/hooks/useMovementScrollEntries.test.js
import { useRef } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'

import useMovementScrollEntries from './useMovementScrollEntries.js'

function Harness({ enabled = true }) {
  const scrollRef = useRef(null)
  const headerRef = useRef(null)
  const movementRef = useRef(null)
  const entries = useMovementScrollEntries({
    enabled, resetKey: 'team-season', scrollRef, headerRef, movementRef,
  })

  return (
    <div ref={scrollRef} data-testid='scroll'>
      <div ref={headerRef} data-testid='header' />
      <div ref={movementRef}>
        <div data-testid='season' data-movement-toolbar-entry='26/27:season' />
        <div data-testid='previous' data-movement-toolbar-entry='25/26:season' />
      </div>
      <output data-testid='entries'>{entries.join(',')}</output>
    </div>
  )
}

test('adds season summaries in scroll order and removes them when scrolling back', () => {
  jest.useFakeTimers()
  const bounds = { header: 50, season: 90, previous: 300 }
  const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return { bottom: bounds[this.dataset.testid] || 0 }
  })
  const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => setTimeout(callback, 0))
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearTimeout)
  const originalObserver = global.ResizeObserver
  global.ResizeObserver = class {
    observe() {}
    disconnect() {}
  }
  const { rerender, unmount } = render(<Harness />)
  const scroll = () => {
    fireEvent.scroll(screen.getByTestId('scroll'))
    act(() => jest.runOnlyPendingTimers())
  }

  act(() => jest.runOnlyPendingTimers())
  expect(screen.getByTestId('entries').textContent).toBe('')
  bounds.season = 40
  scroll()
  expect(screen.getByTestId('entries').textContent).toBe('26/27:season')
  bounds.previous = 40
  scroll()
  expect(screen.getByTestId('entries').textContent).toBe('26/27:season,25/26:season')
  bounds.previous = 300
  scroll()
  expect(screen.getByTestId('entries').textContent).toBe('26/27:season')
  rerender(<Harness enabled={false} />)
  expect(screen.getByTestId('entries').textContent).toBe('')

  unmount()
  rect.mockRestore()
  raf.mockRestore()
  cancel.mockRestore()
  global.ResizeObserver = originalObserver
  jest.useRealTimers()
})
