// previewDomainCard/domains/player/games/components/drawer/EditDrawerFields.js

import React, { useMemo } from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import OnSquadSelector from '../../../../../../../../../../ui/fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../../../../../../../../ui/fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../../../../../../../../ui/fields/inputUi/games/GoalField.js'
import AssistField from '../../../../../../../../../../ui/fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../../../../../../../../ui/fields/inputUi/games/TimePlayedField.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'
import { getGameStatsLimits } from '../newForm/newFormDrawer.utils.js'

export default function EditDrawerFields({
  draft,
  setField,
  player,
  pending = false,
}) {
  const limits = useMemo(() => {
    return getGameStatsLimits({
      player,
      gameId: draft?.gameId,
      playerId: draft?.playerId,
    })
  }, [player, draft?.gameId, draft?.playerId])

  const isFieldsDisabled = pending || !draft?.gameId
  const goalsLocked = !!draft?.gameId && limits.goalsMax <= 0
  const assistsLocked = !!draft?.gameId && limits.assistsMax <= 0

  return (
    <Box sx={sx.fieldsRoot}>
      {limits.hasGoalUpdates ? (
        <Typography level="body-xs" color="warning" sx={sx.statusText}>
          כבר קיים עדכון שערים או בישולים למשחק זה
        </Typography>
      ) : null}
      
      <Box sx={sx.fieldsBlock(true)}>
        <Box sx={sx.booleanGrid}>
          <OnSquadSelector
            value={draft.isSelected}
            onChange={(v) => {
              setField('isSelected', v)
              if (!v) setField('isStarting', false)
            }}
            disabled={isFieldsDisabled}
            size="md"
            label="נכלל בסגל"
          />

          <OnSquadStart
            value={draft.isStarting}
            onChange={(v) => setField('isStarting', v)}
            disabled={isFieldsDisabled || !draft.isSelected}
            size="md"
            label="פותח בהרכב"
          />
        </Box>

        <Box sx={{ ...sx.statsGrid, pt: 3 }}>
          <GoalField
            value={draft.goals}
            size="md"
            max={limits.goalsMax}
            onChange={(v) => setField('goals', v)}
            disabled={isFieldsDisabled || goalsLocked}
            helperText={
              goalsLocked
                ? 'לא ניתן להוסיף שערים, כבר קיים עדכון מלא למשחק'
                : `ניתן לעדכן עד ${limits.goalsMax} שערים`
            }
          />

          <AssistField
            value={draft.assists}
            size="md"
            max={limits.assistsMax}
            onChange={(v) => setField('assists', v)}
            disabled={isFieldsDisabled || assistsLocked}
            helperText={
              assistsLocked
                ? 'לא ניתן להוסיף בישולים, כבר קיים עדכון מלא למשחק'
                : `ניתן לעדכן עד ${limits.assistsMax} בישולים`
            }
          />

          <TimePlayedField
            value={draft.timePlayed}
            size="md"
            onChange={(v) => setField('timePlayed', v)}
            disabled={isFieldsDisabled}
          />
        </Box>
      </Box>
    </Box>
  )
}
