// teamProfile/sharedUi/insights/teamPlayers/sections/UsageSection.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsSection,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  MetricCardsGrid,
  SummaryChips,
} from '../components/index.js'

import { sectionsSx as sx } from './sx/sections.sx.js'

export default function UsageSection({
  cards = [],
  summaryChips = [],
  takeaway,
}) {
  return (
    <LocalInsightsSection
      title="שימוש בפועל"
      sub="בדיקה האם דקות המשחק תואמות את המעמד שתוכנן לכל שחקן"
      icon="playTimeRate"
    >
      <Box sx={sx.block}>
        <MetricCardsGrid cards={cards} />

        <SummaryChips cards={summaryChips} />

        {takeaway ? (
          <Takeaway
            item={takeaway}
            icon="playTimeRate"
            value="תובנת שימוש"
            withMenu={false}
          />
        ) : null}
      </Box>
    </LocalInsightsSection>
  )
}
