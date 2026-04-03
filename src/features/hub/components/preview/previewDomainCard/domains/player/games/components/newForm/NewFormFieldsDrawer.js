// previewDomainCard/domains/player/games/components/newForm/NewFormFieldsDrawer.js

import React, { useMemo } from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import GameSelectField from '../../../../../../../../../../ui/fields/selectUi/games/GameSelectField.js'
import OnSquadSelector from '../../../../../../../../../../ui/fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../../../../../../../../ui/fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../../../../../../../../ui/fields/inputUi/games/GoalField.js'
import AssistField from '../../../../../../../../../../ui/fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../../../../../../../../ui/fields/inputUi/games/TimePlayedField.js'

import { drawerNewFormSx as sx } from '../../sx/newFormDrawer.sx.js'
import { getGameStatsLimits } from './newFormDrawer.utils.js'

export default function NewFormFieldsDrawer({
  draft,
  setField,
  player,
  pending = false,
}) {
  const isGameChosen = !!draft?.gameId
  const isFieldsDisabled = pending || !isGameChosen

  const limits = useMemo(() => {
    return getGameStatsLimits({
      player,
      gameId: draft?.gameId,
      playerId: draft?.playerId,
    })
  }, [player, draft?.gameId, draft?.playerId])

  const goalsLocked = isGameChosen && limits.goalsMax <= 0
  const assistsLocked = isGameChosen && limits.assistsMax <= 0

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <GameSelectField
        value={draft.gameId}
        onChange={(nextGameId) => setField('gameId', nextGameId)}
        player={player}
        disabled={pending}
        label="בחירת משחק"
        size="md"
        placeholder="בחר משחק לשיוך השחקן"
      />

      <Typography
        level="body-xs"
        color={isGameChosen ? 'success' : 'warning'}
        sx={sx.statusText}
      >
        {isGameChosen
          ? 'המשחק נבחר, ניתן לעדכן נתוני שחקן למשחק'
          : 'יש לבחור משחק לפני עדכון שאר השדות'}
      </Typography>

      {isGameChosen && limits.hasGoalUpdates ? (
        <Typography level="body-xs" color="warning" sx={sx.statusText}>
          כבר קיים עדכון שערים או בישולים למשחק זה
        </Typography>
      ) : null}

      <Divider />

      <Box sx={sx.fieldsBlock(isGameChosen)}>
        <Box sx={sx.booleanGrid}>
          <OnSquadSelector
            value={draft.isSelected}
            onChange={(v) => setField('isSelected', v)}
            disabled={isFieldsDisabled}
            size="md"
            label="נכלל בסגל"
          />

          <OnSquadStart
            value={draft.isStarting}
            onChange={(v) => setField('isStarting', v)}
            disabled={isFieldsDisabled}
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
              isGameChosen
                ? goalsLocked
                  ? 'לא ניתן להוסיף שערים, כבר קיים עדכון מלא למשחק'
                  : `ניתן לעדכן עד ${limits.goalsMax} שערים`
                : ''
            }
          />

          <AssistField
            value={draft.assists}
            size="md"
            max={limits.assistsMax}
            onChange={(v) => setField('assists', v)}
            disabled={isFieldsDisabled || assistsLocked}
            helperText={
              isGameChosen
                ? assistsLocked
                  ? 'לא ניתן להוסיף בישולים, כבר קיים עדכון מלא למשחק'
                  : `ניתן לעדכן עד ${limits.assistsMax} בישולים`
                : ''
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
