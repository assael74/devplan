// src/features/playersDatabase/ui/pages/teamPage/information/hooks/usePerformanceTableHeight.js

import { useLayoutEffect, useState } from 'react'

export default function usePerformanceTableHeight({
  stage,
  scrollRef,
  headerRef,
  toolbarRef,
  tableRef,
}) {
  const [maxHeight, setMaxHeight] = useState(580)

  useLayoutEffect(() => {
    const root = scrollRef?.current
    const header = headerRef.current
    const toolbar = toolbarRef.current
    const table = tableRef.current
    if (!stage || !root || !header || !toolbar || !table) return undefined
    let frame = null
    const measure = () => {
      frame = null
      const rootTop = root.getBoundingClientRect().top + root.clientTop
      const tableEnd = table.getBoundingClientRect().bottom - rootTop + root.scrollTop
      const trailingSpace = Math.max(0, root.scrollHeight - tableEnd)
      const toolbarEnd = toolbar.getBoundingClientRect().bottom - header.getBoundingClientRect().top
      const horizontalScrollbar = table.offsetHeight - table.clientHeight
      // Fit the last table below the sticky toolbar at the outer scroll limit.
      // DataTable retains its fixed header and scrolls only the player rows.
      setMaxHeight(Math.max(0, Math.min(580, Math.floor(
        root.clientHeight - toolbarEnd - 8 - trailingSpace - horizontalScrollbar
      ))))
    }
    const schedule = () => {
      if (frame === null) frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    ;[root, header, toolbar, table].forEach(element => observer.observe(element))
    root.addEventListener('animationend', schedule)
    measure()
    return () => {
      observer.disconnect()
      root.removeEventListener('animationend', schedule)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [stage, scrollRef, headerRef, toolbarRef, tableRef])

  return maxHeight
}
