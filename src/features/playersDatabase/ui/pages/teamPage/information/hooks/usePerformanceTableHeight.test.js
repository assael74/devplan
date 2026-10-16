// src/features/playersDatabase/ui/pages/teamPage/information/hooks/usePerformanceTableHeight.test.js

import { useRef } from 'react'
import { act, render, screen } from '@testing-library/react'
import usePerformanceTableHeight from './usePerformanceTableHeight.js'

function Harness({ stage }) {
  const scrollRef = useRef(null)
  const headerRef = useRef(null)
  const toolbarRef = useRef(null)
  const tableRef = useRef(null)
  const height = usePerformanceTableHeight({ stage, scrollRef, headerRef, toolbarRef, tableRef })
  return <div ref={scrollRef} data-testid='scroll'>
    <div ref={headerRef} data-testid='header' />
    <div ref={toolbarRef} data-testid='toolbar' />
    <div ref={tableRef} data-testid='table' />
    <output>{height}</output>
  </div>
}

test('outer scroll ends below the toolbar even after resizing or adding the second row', () => {
  jest.useFakeTimers()
  const originalObserver = global.ResizeObserver
  let onResize
  global.ResizeObserver = class {
    constructor(callback) { onResize = callback }
    observe() {}
    disconnect() {}
  }
  const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => setTimeout(callback, 0))
  const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearTimeout)
  const bounds = { scroll: { top: 100 }, header: { top: 100 }, toolbar: { bottom: 230 }, table: { bottom: 1000 } }
  const rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return bounds[this.dataset.testid] || {}
  })
  const { rerender, unmount } = render(<Harness stage={0} />)
  const scroll = screen.getByTestId('scroll')
  Object.defineProperties(scroll, {
    clientHeight: { configurable: true, value: 600 },
    scrollHeight: { configurable: true, value: 1320 },
    scrollTop: { configurable: true, value: 400 },
  })
  rerender(<Harness stage={1} />)
  const assertNoOverlap = viewportHeight => {
    const tableHeight = Number(screen.getByRole('status').textContent)
    const tableTopAtScrollEnd = 100 + viewportHeight - 20 - tableHeight
    expect(tableTopAtScrollEnd).toBeGreaterThanOrEqual(bounds.toolbar.bottom + 8)
  }
  assertNoOverlap(600)
  bounds.toolbar.bottom = 265
  rerender(<Harness stage={2} />)
  assertNoOverlap(600)
  Object.defineProperty(scroll, 'clientHeight', { configurable: true, value: 450 })
  act(() => { onResize(); jest.runOnlyPendingTimers() })
  assertNoOverlap(450)
  expect(Number(screen.getByRole('status').textContent)).toBeGreaterThan(0)
  unmount()
  rect.mockRestore()
  raf.mockRestore()
  cancel.mockRestore()
  global.ResizeObserver = originalObserver
  jest.useRealTimers()
})
