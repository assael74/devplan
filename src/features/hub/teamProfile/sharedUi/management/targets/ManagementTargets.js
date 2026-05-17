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

import TeamLeaguePosField from '../../../../../../ui/fields/inputUi/teams/TeamLeaguePosField'
import TeamLeaguePointsField from '../../../../../../ui/fields/inputUi/teams/TeamLeaguePointsField'
import GoalsAgainstField from '../../../../../../ui/fields/inputUi/games/GoalsAgainstField'
import GoalsForField from '../../../../../../ui/fields/inputUi/games/GoalsForField'

import TargetRankPicker from './TargetRankPicker.js'
import TargetsView from './TargetsView.js'
import ManagementTargetsPrintButton from '../print/ManagementTargetsPrintButton.js'

import {
  buildManagementTargetsState,
} from '../../../sharedLogic/management/index.js'

import { targetsSx as sx } from '../sx/targets.sx.js'

export default function ManagementTargets({
  team,
  draft,
  onDraft,
  pending,
  isMobile = false,
  showPrint = true,
}) {
  const model = useMemo(() => {
    return buildManagementTargetsState({
      team,
      draft,
    })
  }, [team, draft])

  const handleField = (field, value) => {
    onDraft({
      ...draft,
      [field]: value,
    })
  }

  return (
    <Sheet variant="soft" sx={sx.card(isMobile)}>
      <Box sx={sx.header}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            יעדי קבוצה
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.25 }}>
            יעד טבלה, מדדי ביצוע ופריסת יעדים לפי הקשר משחק.
          </Typography>
        </Box>

        {showPrint && (
          <ManagementTargetsPrintButton
            team={team}
            draft={draft}
            disabled={pending}
          />
        )}
      </Box>

      <Box sx={sx.leagueTargetsGrid}>
        <Box sx={sx.leagueActualCol}>
          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePosField
              value={draft.leaguePosition || ''}
              size="sm"
              label="מיקום בליגה"
              variant="outlined"
              disabled={pending}
              onChange={(value) => handleField('leaguePosition', value)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <TeamLeaguePointsField
              value={draft.points || ''}
              size="sm"
              label="נקודות בפועל"
              variant="outlined"
              disabled={pending}
              onChange={(value) => handleField('points', value)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <FormControl size="sm">
              <FormLabel>אחוז הצלחה בפועל</FormLabel>

              <Input
                size="sm"
                value={model.actual.actualSuccessRate}
                variant="soft"
                color="primary"
                disabled
                startDecorator={
                  <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                    %
                  </Typography>
                }
                sx={sx.readonlyInput}
              />
            </FormControl>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <GoalsForField
              value={draft.leagueGoalsFor ?? ''}
              size="sm"
              label="שערי זכות בפועל"
              variant="outlined"
              disabled={pending}
              onChange={(value) => handleField('leagueGoalsFor', value)}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <GoalsAgainstField
              value={draft.leagueGoalsAgainst ?? ''}
              size="sm"
              label="שערי חובה בפועל"
              variant="outlined"
              disabled={pending}
              onChange={(value) => handleField('leagueGoalsAgainst', value)}
            />
          </Box>
        </Box>

        <Box sx={sx.leagueTargetsCol}>
          <TargetRankPicker
            draft={draft}
            pending={pending}
            onDraft={onDraft}
            isMobile={isMobile}
          />

          <TargetsView
            targets={model.targets}
            isMobile={isMobile}
          />
        </Box>
      </Box>
    </Sheet>
  )
}
