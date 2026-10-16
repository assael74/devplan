// src/features/playersDatabase/ui/pages/teamPage/information/hooks/usePerformanceScrollStage.test.js

import { useRef } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import usePerformanceScrollStage from './usePerformanceScrollStage.js'

function Harness({ enabled = true, resetKey = 'team-season' }) {
  const scrollRef = useRef(null)
  const headerRef = useRef(null)
  const kpiRef = useRef(null)
  const metricsRef = useRef(null)
  const stage = usePerformanceScrollStage({ enabled, resetKey, scrollRef, headerRef, kpiRef, metricsRef })
  return <div ref={scrollRef} data-testid='scroll'>
    <div ref={headerRef} data-testid='header' />
    <div ref={kpiRef} data-testid='kpi' />
    <div ref={metricsRef} data-testid='metrics' />
    <output data-testid='stage'>{stage}</output>
  </div>
}

test('summary grows only after sections pass the top and shrinks on return, resize and navigation', () => {
  jest.useFakeTimers()
  const bounds = { header: 50, kpi: 300, metrics: 1000 }
  const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return { bottom: bounds[this.dataset.testid] || 0 }
  })
  const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => setTimeout(callback, 0))
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearTimeout)
  const originalObserver = global.ResizeObserver
  let onResize
  global.ResizeObserver = class {
    constructor(callback) { onResize = callback }
    observe() {}
    disconnect() {}
  }
  const { rerender, unmount } = render(<Harness />)
  const flush = () => act(() => jest.runOnlyPendingTimers())
  const scroll = () => {
    fireEvent.scroll(screen.getByTestId('scroll'))
    flush()
  }
  flush()
  expect(screen.getByTestId('stage').textContent).toBe('0')
  bounds.kpi = 40
  scroll()
  expect(screen.getByTestId('stage').textContent).toBe('1')
  bounds.metrics = 40
  scroll()
  expect(screen.getByTestId('stage').textContent).toBe('2')
  bounds.metrics = 90
  scroll()
  expect(screen.getByTestId('stage').textContent).toBe('1')
  bounds.kpi = 90
  act(() => onResize())
  flush()
  expect(screen.getByTestId('stage').textContent).toBe('0')
  bounds.kpi = 10
  scroll()
  rerender(<Harness enabled={false} />)
  expect(screen.getByTestId('stage').textContent).toBe('0')
  bounds.kpi = 300
  rerender(<Harness resetKey='another-team' />)
  flush()
  expect(screen.getByTestId('stage').textContent).toBe('0')
  unmount()
  rect.mockRestore()
  raf.mockRestore()
  cancel.mockRestore()
  global.ResizeObserver = originalObserver
  jest.useRealTimers()
})
