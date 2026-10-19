// src/features/playersDatabase/ui/pages/clubPage/components/ClubOverview.js

import { Box, Card, Typography } from '@mui/joy'

import {
  LeaguePath,
  PerformanceDistribution,
} from '../../../components/club/ClubInsightPrimitives.js'
import { clubPageSx as sx } from '../sx/clubPage.sx.js'
import TeamSignalSummary from '../../../components/teamSignals/TeamSignalSummary.js'

const OverviewMetric = ({ label, children }) => (
  <Card variant='outlined' sx={sx.metricCard}>
    <Typography level='body-xs' sx={sx.metricLabel}>
      {label}
    </Typography>
    {children}
  </Card>
)

export default function ClubOverview({ model }) {
  return (
    <Box sx={sx.sectionGrid}>
      <OverviewMetric label='מסלול ליגות'>
        <LeaguePath model={model.leaguePath} />
      </OverviewMetric>

      <OverviewMetric label='משפחות איתותים'>
        <TeamSignalSummary summary={model.teamSignalSummary} />
      </OverviewMetric>

      <OverviewMetric label='ביצוע קבוצתי'>
        <PerformanceDistribution model={model.performance} />
      </OverviewMetric>

      <OverviewMetric label='ביצוע התקפי'>
        <PerformanceDistribution model={model.attack} />
      </OverviewMetric>
    </Box>
  )
}
