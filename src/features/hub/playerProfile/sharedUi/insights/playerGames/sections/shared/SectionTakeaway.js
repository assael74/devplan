// playerProfile/sharedUi/insights/playerGames/sections/shared/SectionTakeaway.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  Takeaway,
} from '../../../../../../../../ui/patterns/insights/index.js'

export default function SectionTakeaway({ sx, takeaway, }) {
  if (!takeaway?.item) return null

  return (
    <Box sx={sx?.takeawayWrap}>
      <Takeaway
        item={takeaway.item}
        items={takeaway.items}
        details={takeaway.details}
        icon={takeaway.icon}
        value={takeaway.value}
        emptyText={takeaway.emptyText}
      />
    </Box>
  )
}
