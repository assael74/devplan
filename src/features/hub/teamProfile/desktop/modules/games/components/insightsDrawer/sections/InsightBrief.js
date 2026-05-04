import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'
import Accordion from '@mui/joy/Accordion'
import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionGroup from '@mui/joy/AccordionGroup'
import AccordionSummary from '@mui/joy/AccordionSummary'

import { briefSx as sx } from './sx/brief.sx'

const toneColor = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  primary: 'primary',
  neutral: 'neutral',
}

const getPrimaryTakeaway = (items) => {
  return (
    items.find((item) => item?.id === 'action_focus') ||
    items.find((item) => item?.type === 'focus') ||
    items.find((item) => item?.type === 'advantage') ||
    items[0] ||
    null
  )
}

const getDetailItems = (items, primaryTakeaway) => {
  return items.filter((item) => item?.id !== primaryTakeaway?.id)
}

export default function InsightBrief({ brief }) {
  if (!brief) return null

  const items = Array.isArray(brief?.items) ? brief.items : []
  const color = toneColor[brief?.tone] || 'neutral'

  if (brief.status !== 'ready') {
    return (
      <Sheet variant="plain" sx={sx.empty}>
        <Typography level="body-sm" sx={{ lineHeight: 1.5 }}>
          {brief.text || 'אין מספיק נתונים להצגת תובנות ראשוניות.'}
        </Typography>
      </Sheet>
    )
  }

  const primaryTakeaway = getPrimaryTakeaway(items)
  const detailItems = getDetailItems(items, primaryTakeaway)
  const takeawayColor = toneColor[primaryTakeaway?.tone] || color

  return (
    <Sheet variant="plain" sx={sx.root}>
      {detailItems.length ? (
        <AccordionGroup variant="plain">
          <Accordion sx={sx.accordion}>
            <AccordionSummary>
              {primaryTakeaway ? (
                <Box sx={sx.takeaway}>
                  <Box sx={sx.takeawayHead}>
                    <Box sx={sx.takeawayMark(takeawayColor)} />

                    <Typography level="body-sm" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                      {primaryTakeaway.label || 'מוקד פעולה'}
                    </Typography>
                  </Box>

                  <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                    {primaryTakeaway.text}
                  </Typography>
                </Box>
              ) : null}
            </AccordionSummary>

            <AccordionDetails>
              <Box sx={{ display: 'grid', gap: 0.8, pt: 0.25 }}>
                {detailItems.map((item) => (
                  <Box key={item.id} sx={{ display: 'grid', gap: 0.2, minWidth: 0 }}>
                    <Typography level="body-sm" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                      {item.label}
                    </Typography>

                    <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                      {item.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </AccordionGroup>
      ) : null}
    </Sheet>
  )
}
