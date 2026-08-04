// teamProfile/sharedUi/management/targets/ManagementTargets.js

import React, { useMemo } from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Typography,
} from '@mui/joy'

import TeamLeaguePosField from '../../../../../../ui/fields/leagues/TeamLeaguePosField'
import TeamLeaguePointsField from '../../../../../../ui/fields/leagues/TeamLeaguePointsField'
import GoalsAgainstField from '../../../../../../ui/fields/games/GoalsAgainstField'
import GoalsForField from '../../../../../../ui/fields/games/GoalsForField'

import TargetRankPicker from './TargetRankPicker.js'
import TargetsView from './TargetsView.js'

import {
  buildManagementTargetsState,
} from '../../../sharedLogic/management/index.js'
import {
  TEAM_TARGET_POSITION_MODE,
  resolveTeamTargetProfileId,
} from '../../../../../../shared/teams/targets/index.js'

import { targetsSx as sx } from '../sx/targets.sx.js'

const LABELS = {
  leaguePosition: '\u05de\u05e7\u05d5\u05dd \u05d1\u05dc\u05d9\u05d2\u05d4',
  points: '\u05e0\u05e7\u05d5\u05d3\u05d5\u05ea \u05d1\u05e4\u05d5\u05e2\u05dc',
  successRate: '\u05d0\u05d7\u05d5\u05d6 \u05d4\u05e6\u05dc\u05d7\u05d4 \u05d1\u05e4\u05d5\u05e2\u05dc',
  goalsFor: '\u05e9\u05e2\u05e8\u05d9 \u05d6\u05db\u05d5\u05ea \u05d1\u05e4\u05d5\u05e2\u05dc',
  goalsAgainst: '\u05e9\u05e2\u05e8\u05d9 \u05d7\u05d5\u05d1\u05d4 \u05d1\u05e4\u05d5\u05e2\u05dc',
}

export default function ManagementTargets({
  team,
  draft,
  onDraft,
  pending,
  isMobile = false,
}) {
  const model = useMemo(() => {
    return buildManagementTargetsState({
      team,
      draft,
    })
  }, [team, draft])

  const handleField = (field, value) => {
    const nextValue = field === 'leagueGoalsAgainst' && value !== ''
      ? String(Math.max(0, Number(value) || 0))
      : value

    onDraft({
      ...draft,
      [field]: nextValue,
    })
  }

  const handleDefineTarget = () => {
    if (pending) return

    const targetPosition = '1'
    onDraft({
      ...draft,
      targetPositionMode: TEAM_TARGET_POSITION_MODE.EXACT,
      targetPosition,
      targetProfileId: resolveTeamTargetProfileId({
        targetPositionMode: TEAM_TARGET_POSITION_MODE.EXACT,
        targetPosition,
        targetProfileId: '',
      }),
    })
  }

  return (
    <Sheet variant='soft' sx={sx.card(isMobile)}>
      <Box sx={sx.targetSetupGrid(isMobile)}>
        <Box sx={sx.actualPanel(isMobile)}>
          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePosField
              value={draft.leaguePosition || ''}
              size='sm'
              label={LABELS.leaguePosition}
              variant='outlined'
              disabled={pending}
              onChange={value => handleField('leaguePosition', value)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePointsField
              value={draft.points || ''}
              size='sm'
              label={LABELS.points}
              variant='outlined'
              disabled={pending}
              onChange={value => handleField('points', value)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <FormControl size='sm'>
              <FormLabel>{LABELS.successRate}</FormLabel>

              <Input
                size='sm'
                value={model.actual.actualSuccessRate}
                variant='soft'
                color='primary'
                disabled
                startDecorator={(
                  <Typography level='body-xs' sx={{ color: 'text.tertiary' }}>
                    %
                  </Typography>
                )}
                sx={sx.readonlyInput}
              />
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <GoalsForField
              value={draft.leagueGoalsFor || ''}
              size='sm'
              label={LABELS.goalsFor}
              variant='outlined'
              disabled={pending}
              onChange={value => handleField('leagueGoalsFor', value)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <GoalsAgainstField
              value={draft.leagueGoalsAgainst || ''}
              size='sm'
              label={LABELS.goalsAgainst}
              variant='outlined'
              disabled={pending}
              onChange={value => handleField('leagueGoalsAgainst', value)}
            />
          </Box>
        </Box>

        <Box sx={sx.targetPickerPanel}>
          <TargetRankPicker
            draft={draft}
            pending={pending}
            onDraft={onDraft}
            isMobile={isMobile}
          />
        </Box>
      </Box>

      <TargetsView
        targets={model.targets}
        isMobile={isMobile}
        pending={pending}
        onDefineTarget={handleDefineTarget}
      />
    </Sheet>
  )
}
