// teamProfile/sharedUi/insights/teamGames/sections/insight/InsightBrief.js

import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'

import { Takeaway } from '../../../../../../../../ui/patterns/insights/index.js'
import { getPrimaryItem } from '../../../../../../../../ui/patterns/insights/utils/index.js'

import { briefSx as sx } from '../sx/brief.sx'

export default function InsightBrief({ brief }) {
  if (!brief) return null

  const items = Array.isArray(brief?.items) ? brief.items : []

  if (brief.status !== 'ready') {
    return (
      <Sheet variant="plain" sx={sx.empty}>
        <Typography level="body-sm" sx={{ lineHeight: 1.5 }}>
          {brief.text || 'אין מספיק נתונים להצגת תובנות ראשוניות.'}
        </Typography>
      </Sheet>
    )
  }

  const primaryItem = getPrimaryItem(items)

  if (!primaryItem) {
    return null
  }

  return (
    <Sheet variant="plain" sx={sx.root}>
      <Takeaway
        item={primaryItem}
        items={items}
        icon={primaryItem?.type === 'focus' ? 'target' : 'insights'}
        value={primaryItem?.label || 'תובנה'}
      />
    </Sheet>
  )
}
