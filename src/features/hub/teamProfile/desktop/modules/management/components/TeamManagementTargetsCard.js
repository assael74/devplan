// src/features/hub/teamProfile/modules/management/components/TeamManagementTargetsCard.js

import React, { useMemo } from 'react'
import {
  Box,
  Chip,
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

import {
  buildTargetsSummary,
  calcAchievementRate,
  calcActualSuccessRate,
} from '../../../../sharedLogic/management'

import { moduleSx as sx } from '../module.sx.js'

export default function TeamManagementTargetsCard({
  team,
  draft,
  onDraft,
  pending,
}) {
  const targetsSummary = useMemo(() => {
    return buildTargetsSummary(team)
  }, [team])

  const actualSuccessRate = useMemo(() => {
    return calcActualSuccessRate(draft.points, draft.leagueRound)
  }, [draft.points, draft.leagueRound])

  const goalsForAchievementRate = useMemo(() => {
    return calcAchievementRate(
      draft.leagueGoalsFor,
      draft.targetGoalsFor,
      'higher'
    )
  }, [draft.leagueGoalsFor, draft.targetGoalsFor])

  const goalsAgainstAchievementRate = useMemo(() => {
    return calcAchievementRate(
      draft.leagueGoalsAgainst,
      draft.targetGoalsAgainst,
      'lower'
    )
  }, [draft.leagueGoalsAgainst, draft.targetGoalsAgainst])

  const handleField = (field, value) => {
    onDraft({ ...draft, [field]: value })
  }

  return (
    <Sheet variant="soft" sx={sx.card}>
      <Box sx={{ ...sx.cardHeader, mb: 0.8 }}>
        <Box sx={sx.cardTitleRow}>
          <Typography level="title-sm" sx={{ whiteSpace: 'nowrap' }}>
            ביצוע ויעדים
          </Typography>

          <Box sx={sx.targetsSummaryRow}>
            <Chip size="sm" variant="soft" color="neutral">
              יעדים: {targetsSummary.activeTargetsCount}
            </Chip>

            <Chip size="sm" variant="soft" color="success">
              הושגו: {targetsSummary.metTargetsCount}
            </Chip>
          </Box>
        </Box>
      </Box>

      <Box sx={sx.leagueTargetsGrid}>
        <Typography level="body-sm" sx={sx.targetsColTitle}>
          ביצוע בליגה
        </Typography>

        <Typography level="body-sm" sx={sx.targetsColTitle}>
          יעדים
        </Typography>
      </Box>

      <Box sx={sx.leagueTargetsGrid}>
        <Box sx={sx.leagueTargetsCol}>
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
              <FormLabel>אחוז הצלחה</FormLabel>
              <Input
                size="sm"
                value={actualSuccessRate}
                variant="soft"
                color="primary"
                disabled
                sx={{ border: '1px solid', borderColor: 'divider' }}
                endDecorator={
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    %
                  </Typography>
                }
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
          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePosField
              value={draft.targetPosition || ''}
              size="sm"
              label="יעד מיקום בליגה"
              variant="soft"
              color="primary"
              disabled={pending}
              onChange={(v) => handleField('targetPosition', v)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePointsField
              value={draft.targetPoints || ''}
              size="sm"
              label="יעד נקודות"
              variant="soft"
              color="primary"
              disabled={pending}
              onChange={(v) => handleField('targetPoints', v)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <FormControl size="sm">
              <FormLabel>יעד אחוז הצלחה</FormLabel>
              <Input
                size="sm"
                value={draft.targetSuccessRate || ''}
                variant="soft"
                color="primary"
                disabled={pending}
                sx={{ border: '1px solid', borderColor: 'divider' }}
                onChange={(event) => handleField('targetSuccessRate', event.target.value)}
                endDecorator={
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    %
                  </Typography>
                }
              />
            </FormControl>
          </Box>

          <Box sx={sx.targetAchievementRow}>
            <Box sx={{ minWidth: 0 }}>
              <GoalsForField
                value={draft.targetGoalsFor ?? ''}
                size="sm"
                label="יעד שערי זכות"
                variant="soft"
                color="primary"
                disabled={pending}
                onChange={(v) => handleField('targetGoalsFor', v)}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <FormControl size="sm">
                <FormLabel>עמידה</FormLabel>
                <Input
                  size="sm"
                  value={goalsForAchievementRate}
                  variant="soft"
                  color="success"
                  disabled
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                  endDecorator={
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      %
                    </Typography>
                  }
                />
              </FormControl>
            </Box>
          </Box>

          <Box sx={sx.targetAchievementRow}>
            <Box sx={{ minWidth: 0 }}>
              <GoalsAgainstField
                value={draft.targetGoalsAgainst ?? ''}
                size="sm"
                label="יעד שערי חובה"
                variant="soft"
                color="primary"
                disabled={pending}
                onChange={(v) => handleField('targetGoalsAgainst', v)}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <FormControl size="sm">
                <FormLabel>עמידה</FormLabel>
                <Input
                  size="sm"
                  value={goalsAgainstAchievementRate}
                  variant="soft"
                  color="success"
                  disabled
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                  endDecorator={
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      %
                    </Typography>
                  }
                />
              </FormControl>
            </Box>
          </Box>
        </Box>
      </Box>
    </Sheet>
  )
}
