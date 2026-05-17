// teamProfile/sharedUi/insights/teamPlayers/sections/ProductionSection.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsSection,
  ModeBlockedPlaceholder,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  AnnualPerformanceSection,
  MetricCardsGrid,
} from '../components/index.js'

import {
  TeamPlayersInsightsPrintButton,
} from '../print/index.js'

import { sectionsSx as sx } from './sx/sections.sx.js'

export default function ProductionSection({
  cards = [],
  takeaway,
  production = {},
  meta = {},
  games = [],
  team,
  performanceScope,
  onPerformanceScopeChange,
  playerPerformanceRows = [],
}) {
  return (
    <>
      <LocalInsightsSection
        title="ביצוע ותפוקה"
        sub="תפוקה התקפית לצד מוכנות עתידית למדדי ביצוע הגנתי"
        icon="attack"
      >
        <Box sx={sx.block}>
          <MetricCardsGrid cards={cards} />

          {takeaway ? (
            <Takeaway
              item={takeaway}
              icon="attack"
              value="תובנת ביצוע"
              withMenu={false}
            />
          ) : null}

          {!meta?.defenseReady ? (
            <ModeBlockedPlaceholder
              title="ביצוע הגנתי אישי עדיין לא זמין"
              text={
                production?.defense?.reason ||
                'חסר פירוט משחקים פר־שחקן כדי לחשב ביצוע הגנתי אמין.'
              }
              icon="shield"
            />
          ) : null}
        </Box>
      </LocalInsightsSection>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <TeamPlayersInsightsPrintButton
          team={team}
          rows={playerPerformanceRows}
          games={games}
          performanceScope={performanceScope}
          disabled={!playerPerformanceRows.length}
        />
      </Box>

      <AnnualPerformanceSection
        rows={playerPerformanceRows}
        games={games}
        performanceScope={performanceScope}
        onPerformanceScopeChange={onPerformanceScopeChange}
      />
    </>
  )
}
