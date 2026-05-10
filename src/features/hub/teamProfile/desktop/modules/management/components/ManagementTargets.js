import React, { useMemo } from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Sheet,
  Typography,
} from '@mui/joy'

import TeamLeaguePosField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'
import TeamLeaguePointsField from '../../../../../../../ui/fields/inputUi/teams/TeamLeaguePointsField'
import GoalsAgainstField from '../../../../../../../ui/fields/inputUi/games/GoalsAgainstField'
import GoalsForField from '../../../../../../../ui/fields/inputUi/games/GoalsForField'

import TargetRankPicker from './TargetRankPicker.js'
import TargetsView from './TargetsView.js'

import {
  buildTeamTargetsState,
} from '../../../../../../../shared/teams/targets/index.js'

import {
  calcAchievementRate,
  calcActualSuccessRate,
} from '../../../../sharedLogic/management'

import { targetsSx as sx } from './sx/targets.sx.js'

export default function ManagementTargets({
  team,
  draft,
  onDraft,
  pending,
}) {
  const liveTargets = useMemo(() => {
    return buildTeamTargetsState({
      ...(team || {}),
      ...(draft || {}),
    })
  }, [team, draft])

  const targetValues = liveTargets?.values || {}

  const actualSuccessRate = useMemo(() => {
    return calcActualSuccessRate(draft.points, draft.leagueRound)
  }, [draft.points, draft.leagueRound])

  const goalsForAchievementRate = useMemo(() => {
    return calcAchievementRate(
      draft.leagueGoalsFor,
      targetValues.goalsFor,
      'higher'
    )
  }, [draft.leagueGoalsFor, targetValues.goalsFor])

  const goalsAgainstAchievementRate = useMemo(() => {
    return calcAchievementRate(
      draft.leagueGoalsAgainst,
      targetValues.goalsAgainst,
      'lower'
    )
  }, [draft.leagueGoalsAgainst, targetValues.goalsAgainst])

  const handleField = (field, value) => {
    onDraft({ ...draft, [field]: value })
  }

  return (
    <Sheet variant="soft" sx={sx.card}>
      <Box sx={sx.leagueTargetsGrid}>
        <Box sx={sx.leagueActualCol}>
          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePosField
              value={draft.leaguePosition || ''}
              size="sm"
              label="מיקום בליגה"
              variant="outlined"
              disabled={pending}
              onChange={(v) => handleField('leaguePosition', v)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePointsField
              value={draft.points || ''}
              size="sm"
              label="נקודות בפועל"
              variant="outlined"
              disabled={pending}
              onChange={(v) => handleField('points', v)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <FormControl size="sm">
              <FormLabel>אחוז הצלחה בפועל</FormLabel>

              <Input
                size="sm"
                value={actualSuccessRate}
                variant="soft"
                color="primary"
                disabled
                startDecorator={
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    %
                  </Typography>
                }
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  '& input': {
                    textAlign: 'left',
                  },
                }}
              />
            </FormControl>
          </Box>

          <Box sx={sx.actualGoalsRow}>
            <Box sx={{ minWidth: 0 }}>
              <GoalsForField
                value={draft.leagueGoalsFor ?? ''}
                size="sm"
                label="שערי זכות בפועל"
                variant="outlined"
                disabled={pending}
                onChange={(v) => handleField('leagueGoalsFor', v)}
              />
            </Box>
          </Box>

          <Box sx={sx.actualGoalsRow}>
            <Box sx={{ minWidth: 0 }}>
              <GoalsAgainstField
                value={draft.leagueGoalsAgainst ?? ''}
                size="sm"
                label="שערי חובה בפועל"
                variant="outlined"
                disabled={pending}
                onChange={(v) => handleField('leagueGoalsAgainst', v)}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={sx.leagueTargetsCol}>
          <Box sx={sx.targetRankArea}>
            <TargetRankPicker
              draft={draft}
              pending={pending}
              onDraft={onDraft}
            />

            <TargetsView targets={liveTargets} />
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
