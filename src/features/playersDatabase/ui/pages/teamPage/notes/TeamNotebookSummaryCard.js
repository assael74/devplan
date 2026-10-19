// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookSummaryCard.js

import * as React from 'react'
import { Box, Button, Typography } from '@mui/joy'
import MentionContent from '../../../../../../ui/patterns/mentions/MentionContent.js'
import { teamNotebookSx as sx } from './sx/teamNotebook.sx.js'

const COLLAPSED_HEIGHT = 32

export default function TeamNotebookSummaryCard({ step, content, text, open }) {
  const textRef = React.useRef(null)
  const [expanded, setExpanded] = React.useState(false)
  const [fullHeight, setFullHeight] = React.useState(COLLAPSED_HEIGHT)
  const hasMore = fullHeight > COLLAPSED_HEIGHT + 1

  React.useEffect(() => {
    if (!open) setExpanded(false)
  }, [open])

  React.useLayoutEffect(() => {
    const element = textRef.current
    if (!element) return undefined
    const measure = () => setFullHeight(element.scrollHeight)
    measure()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [content, text])

  return (
    <Box sx={sx.summaryCard(expanded)}>
      <Typography level='title-sm' sx={sx.summaryCardTitle}>{step.label}</Typography>
      <Typography
        ref={textRef}
        id={`notebook-summary-content-${step.id}`}
        level='body-sm'
        sx={sx.summaryText(expanded ? fullHeight : COLLAPSED_HEIGHT, expanded, hasMore)}
      >
        {text?.trim() ? <MentionContent value={content} /> : 'לא נכתבה הערה.'}
      </Typography>
      {hasMore && (
        <Button
          size='sm'
          variant='plain'
          aria-expanded={expanded}
          aria-controls={`notebook-summary-content-${step.id}`}
          sx={sx.summaryMoreButton}
          onClick={() => setExpanded(current => !current)}
        >
          {expanded ? 'הצג פחות' : 'הצג עוד'}
        </Button>
      )}
    </Box>
  )
}
