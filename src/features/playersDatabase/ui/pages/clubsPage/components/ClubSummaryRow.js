import { Box, Typography } from '@mui/joy'

import ClubIdentity from '../../../components/club/ClubIdentity.js'
import {
  LeaguePath,
  PerformancePriorityChips,
  TransferSummary,
} from '../../../components/club/ClubInsightPrimitives.js'
import { clubSharedSx } from '../../../components/club/sx/clubShared.sx.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

const Metric = ({ label, iconId = '', hideLabel = false, blockSx, children }) => (
  <Box sx={[sx.metricBlock, blockSx]}>
    {!hideLabel ? (
      <Box sx={clubSharedSx.metricLabelRow}>
        <Typography level='body-xs' sx={clubSharedSx.metricLabel}>
          {label}
        </Typography>
        {iconId ? iconUi({ id: iconId, size: 'sm' }) : null}
      </Box>
    ) : null}
    {children}
  </Box>
)

const buildSummaryAreas = ({ club, model }) => ([
  {
    id: 'club',
    label: 'מועדון',
    connected: true,
    contentSx: sx.summaryClubAreaContentBox,
    content: <ClubIdentity club={club} sx={sx.summaryClubIdentityContent} />,
  },
  {
    id: 'league-path',
    label: 'מסלול ליגות',
    connected: true,
    content: (
      <Metric label='מסלול ליגות' hideLabel blockSx={sx.leaguePathMetric}>
        <LeaguePath
          model={model.leaguePath}
          showSecondary={false}
          sx={sx.summaryLeaguePathContent}
        />
      </Metric>
    ),
  },
  {
    id: 'defense',
    label: 'ביצוע הגנתי',
    connected: true,
    content: <PerformancePriorityChips model={model.defense} iconId='defensive' distribute />,
  },
  {
    id: 'offense',
    label: 'ביצוע התקפי',
    connected: true,
    content: <PerformancePriorityChips model={model.offense} iconId='offensive' distribute />,
  },
  {
    id: 'transfers',
    label: 'העברות',
    content: <TransferSummary model={model.transfers} />,
  },
])

const SummaryAreaBox = ({ area }) => (
  <Box
    data-summary-area={area.id}
    sx={[
      sx.summaryAreaBox,
      area.connected && sx.summaryAreaContentBox,
      area.contentSx,
    ]}
  >
    {area.connected ? area.content : (
      <Typography level='body-xs' sx={sx.summaryAreaPlaceholder}>
        {area.label}
      </Typography>
    )}
  </Box>
)

export default function ClubSummaryRow({
  club,
  model,
}) {
  const summaryAreas = buildSummaryAreas({ club, model })

  return (
    <Box sx={sx.summaryRow}>
      {summaryAreas.map(area => (
        <SummaryAreaBox key={area.id} area={area} />
      ))}
    </Box>
  )
}
