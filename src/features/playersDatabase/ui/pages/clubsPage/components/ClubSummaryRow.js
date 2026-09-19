// src/features/playersDatabase/ui/pages/clubsPage/components/ClubSummaryRow.js
import { Box, Typography } from '@mui/joy'

import ClubIdentity from '../../../components/club/ClubIdentity.js'
import ClubSummarySpotlight from './ClubSummarySpotlight.js'
import { clubSummaryRowSx as sx } from './sx/clubSummaryRow.sx.js'

const buildSummaryAreas = ({ club, model }) => ([
  {
    id: 'club',
    label: 'מועדון',
    connected: true,
    contentSx: sx.summaryClubAreaContentBox,
    content: <ClubIdentity club={club} sx={sx.summaryClubIdentityContent} />,
  },
  {
    id: 'spotlight',
    label: 'איתות מרכזי',
    connected: true,
    contentSx: sx.summarySpotlightAreaContentBox,
    content: (
      <ClubSummarySpotlight
        model={model.primarySpotlight}
      />
    ),
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
