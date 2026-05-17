// TEAMPROFILE/sharedUi/insights/teamPlayers/TeamPlayersInsightsContent.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsGroup,
  ActionItemsLayout,
} from './layout/index.js'

import {
  BuildSection,
} from './buildSection/index.js'

import {
  OutcomeSection,
} from './outcomeSection/index.js'

import {
  useTeamPlayersInsightsModel,
} from './useTeamPlayersInsightsModel.js'

const scopeInitial = {
  mode: 'season',
  limit: null,
  fromGameKey: null,
  toGameKey: null,
}

const LoadingContent = () => {
  return (
    <LocalInsightsGroup
      title="מבנה הסגל"
      sub="טעינת תובנות שחקני הקבוצה"
      icon="players"
      chip="מבנה"
      chipColor="primary"
    />
  )
}

export default function TeamPlayersInsightsContent({
  rows,
  summary,
  team,
  enabled = true,
}) {
  const [scope] = React.useState(scopeInitial)

  const model = useTeamPlayersInsightsModel({
    rows,
    summary,
    team,
    enabled,
    defer: true,
    performanceScope: scope,
  })

  if (model.isBuilding) {
    return <LoadingContent />
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <LocalInsightsGroup
        color='teams'
        title="תהליך בניית הסגל"
        icon="targets"
        chip="מצב בנייה"
        chipColor="primary"
      >
        <BuildSection model={model.build} />
      </LocalInsightsGroup>

      <Box
        sx={{
          pt: 2.25,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <LocalInsightsGroup
          color='players'
          title="תפקוד הסגל בפועל"
          icon="projection"
          chip="מצב בפועל"
          chipColor="success"
        >
          <OutcomeSection model={model.outcomeView} />
        </LocalInsightsGroup>
      </Box>

      <LocalInsightsGroup
        title="המלצות"
        icon="insights"
        chip="המלצות"
        chipColor="primary"
      >
        <ActionItemsLayout model={model.actions} />
      </LocalInsightsGroup>
    </Box>
  )
}
