// TEAMPROFILE/sharedUi/insights/teamPlayers/TeamPlayersInsightsContent.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsGroup,
} from './layout/index.js'

import {
  BuildSection,
} from './buildSection/index.js'

import {
  PerformanceScopeBar,
} from './outcomeSection/scope/index.js'

import {
  OutcomeSection,
} from './outcomeSection/index.js'

import {
  RecommendSection,
} from './recommendSection/index.js'

import {
  PrintButton,
} from './print/index.js'

import {
  useTeamPlayersInsightsModel,
} from './useTeamPlayersInsightsModel.js'

const scopeInitial = {
  mode: 'season',
  limit: null,
  fromGameKey: null,
  toGameKey: null,
}

const emptyArray = []

const getTeamGames = team => {
  return Array.isArray(team?.teamGames) ? team.teamGames : emptyArray
}

const getScopeResetKey = ({ resetKey, scope, }) => {
  return [
    resetKey || 'default',
    scope?.mode || 'season',
    scope?.fromGameKey || '',
    scope?.toGameKey || '',
  ].join('__')
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
  resetKey,
}) {
  const [scope, setScope] = React.useState(scopeInitial)

  const games = React.useMemo(() => {
    return getTeamGames(team)
  }, [team])

  const recommendationsResetKey = React.useMemo(() => {
    return getScopeResetKey({
      resetKey,
      scope,
    })
  }, [resetKey, scope])

  React.useEffect(() => {
    setScope(scopeInitial)
  }, [resetKey])

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
        color="teams"
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            p: 1,
          }}
        >
          <PrintButton
            team={team}
            model={model}
            games={games}
            performanceScope={scope}
            disabled={!model?.playerPerformanceRows?.length}
          />
        </Box>
        <LocalInsightsGroup
          color="players"
          title="תפקוד הסגל בפועל"
          icon="projection"
          chip="מצב בפועל"
          chipColor="success"
        >
          <PerformanceScopeBar
            games={games}
            value={scope}
            onChange={setScope}
          />

          <OutcomeSection model={model.outcomeView} />
        </LocalInsightsGroup>
      </Box>

      <LocalInsightsGroup
        title="המלצות"
        icon="insights"
        chip="המלצות"
        chipColor="primary"
      >
        <RecommendSection
          model={model?.outcomeView?.recommendations}
          resetKey={recommendationsResetKey}
        />
      </LocalInsightsGroup>
    </Box>
  )
}
