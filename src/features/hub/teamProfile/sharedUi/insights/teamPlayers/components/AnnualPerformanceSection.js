// teamProfile/sharedUi/insights/teamPlayers/components/AnnualPerformanceSection.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  LocalInsightsSection,
} from '../../../../../../../ui/patterns/insights/index.js'

import PerformanceScopeBar from './PerformanceScopeBar.js'
import PerformanceProfileSection from './PerformanceProfileSection.js'

import {
  getOrderedProfiles,
} from './playerPerformance.helpers.js'

import { performanceSx as sx } from './sx/performance.sx.js'

export default function AnnualPerformanceSection({
  rows,
  games,
  performanceScope,
  onPerformanceScopeChange,
}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const profiles = getOrderedProfiles()

  return (
    <LocalInsightsSection
      title="ביצוע שנתי"
      icon="chart"
    >
      <Box sx={sx.annualRoot}>
        <PerformanceScopeBar
          games={games}
          value={performanceScope}
          onChange={onPerformanceScopeChange}
        />

        <Typography level="body-xs" sx={sx.tvaText}>
          TVA (מדד השפעה מצטברת): התועלת או הנזק המצטבר שהשחקן ייצר עבור הקבוצה לאורך כל דקות המשחק שלו העונה.
        </Typography>

        {!safeRows.length ? (
          <Sheet variant="soft" sx={sx.emptyAnnual}>
            <Typography level="body-sm">
              אין עדיין נתוני scoring זמינים להצגת ביצוע שנתי.
            </Typography>
          </Sheet>
        ) : (
          profiles.map((profile) => {
            return (
              <PerformanceProfileSection
                key={profile.id}
                profile={profile}
                rows={safeRows}
              />
            )
          })
        )}
      </Box>
    </LocalInsightsSection>
  )
}
