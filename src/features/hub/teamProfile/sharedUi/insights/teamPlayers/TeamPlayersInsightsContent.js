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
const emptyObject = {}

const getTeamGames = team => {
  return Array.isArray(team?.teamGames) ? team.teamGames : emptyArray
}

const isInitialScope = scope => {
  return (
    (scope?.mode || 'season') === 'season' &&
    !scope?.limit &&
    !scope?.fromGameKey &&
    !scope?.toGameKey
  )
}

const getScopeResetKey = ({ resetKey, scope }) => {
  return [
    resetKey || 'default',
    scope?.mode || 'season',
    scope?.fromGameKey || '',
    scope?.toGameKey || '',
  ].join('__')
}

export default function TeamPlayersInsightsContent({
  rows,
  summary,
  team,
  model: externalModel,
  enabled = true,
  resetKey,
}) {
  const [scope, setScope] = React.useState(scopeInitial)

  const games = React.useMemo(() => {
    return getTeamGames(team)
  }, [team])

  const useExternalModel = !!externalModel && isInitialScope(scope)

  const localModel = useTeamPlayersInsightsModel({
    rows,
    summary,
    team,
    enabled: enabled && !useExternalModel,
    defer: true,
    performanceScope: scope,
  })

  const model = useExternalModel ? externalModel : localModel
  const isLoading = !model || model.isBuilding

  const safeModel = model || emptyObject
  const outcomeView = safeModel.outcomeView || emptyObject
  const buildModel = safeModel.build || emptyObject

  const recommendationsResetKey = React.useMemo(() => {
    return getScopeResetKey({
      resetKey,
      scope,
    })
  }, [resetKey, scope])

  React.useEffect(() => {
    setScope(scopeInitial)
  }, [resetKey])

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <LocalInsightsGroup
        color="teams"
        title="תהליך בניית הסגל"
        icon="targets"
        chip={isLoading ? 'בטעינה' : 'מצב בנייה'}
        chipColor={isLoading ? 'neutral' : 'primary'}
      >
        <BuildSection
          model={buildModel}
          loading={isLoading}
        />
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
            minHeight: 44,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            p: 1,
          }}
        >
          {!isLoading ? (
            <PrintButton
              team={team}
              model={safeModel}
              games={games}
              performanceScope={scope}
              disabled={!safeModel?.playerPerformanceRows?.length}
            />
          ) : null}
        </Box>

        <LocalInsightsGroup
          color="players"
          title="תפקוד הסגל בפועל"
          icon="projection"
          chip={isLoading ? 'בטעינה' : 'מצב בפועל'}
          chipColor={isLoading ? 'neutral' : 'success'}
        >
          <PerformanceScopeBar
            games={games}
            value={scope}
            onChange={setScope}
          />

          <OutcomeSection
            model={outcomeView}
            loading={isLoading}
          />
        </LocalInsightsGroup>
      </Box>

      <LocalInsightsGroup
        title="המלצות"
        icon="insights"
        chip={isLoading ? 'בטעינה' : 'המלצות'}
        chipColor={isLoading ? 'neutral' : 'primary'}
      >
        <RecommendSection
          model={outcomeView?.recommendations}
          resetKey={recommendationsResetKey}
          loading={isLoading}
        />
      </LocalInsightsGroup>
    </Box>
  )
}
