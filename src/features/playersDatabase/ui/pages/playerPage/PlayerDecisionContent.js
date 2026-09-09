import * as React from 'react'
import { Box } from '@mui/joy'

import PlayerChecksSection from './PlayerChecksSection.js'
import PlayerDecisionHero from './PlayerDecisionHero.js'
import PlayerMultiSeasonPath from './PlayerMultiSeasonPath.js'
import { buildPlayerScoutView } from './logic/playerScoutView.js'
import { playerDecisionContentSx as sx } from './sx/playerDecisionContent.sx.js'

export default function PlayerDecisionContent({ player = {}, historyRows = [], catalogSeasonKey = '' }) {
  const view = React.useMemo(() => buildPlayerScoutView({ player, historyRows }), [player, historyRows])

  return (
    <Box sx={sx.root}>
      <PlayerDecisionHero player={player} view={view} />
      <PlayerMultiSeasonPath player={player} historyRows={historyRows} catalogSeasonKey={catalogSeasonKey} />
      <PlayerChecksSection questions={view.questions} />
    </Box>
  )
}
