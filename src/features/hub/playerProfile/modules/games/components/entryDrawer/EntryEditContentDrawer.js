// playerProfile/modules/games/components/entryDrawer/EntryEditContentDrawer.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import OnSquadSelector from '../../../../../../../ui/fields/checkUi/games/OnSquadSelector.js'
import OnSquadStart from '../../../../../../../ui/fields/checkUi/games/OnSquadStart.js'
import GoalField from '../../../../../../../ui/fields/inputUi/games/GoalField.js'
import AssistField from '../../../../../../../ui/fields/inputUi/games/AssistField.js'
import TimePlayedField from '../../../../../../../ui/fields/inputUi/games/TimePlayedField.js'

import { entryEditDrawerSx as sx } from './sx/entryEditDrawer.sx.js'
import { getGameStatsLimits } from './logic/entryEditDrawer.utils.js'

export default function EntryEditContentDrawer({
  draft,
  setField,
  player,
  pending = false,
}) {
  const limits = useMemo(() => {
    return getGameStatsLimits({
      game: draft?.raw,
      playerId: draft?.playerId,
      draft,
    })
  }, [draft])

  const isFieldsDisabled = pending || !draft?.gameId
  const goalsLocked = !!draft?.gameId && limits.goalsLeft <= 0
  const assistsLocked = !!draft?.gameId && limits.assistsLeft <= 0
  const textG = `נכבשו ${limits.totalGoalsInGame} שערים · עודכנו כבר ${limits.otherGoalsUsed} · נותר ${limits.goalsLeft} לעדכון`
  const textA = `נכבשו ${limits.totalAssistsInGame} · ${limits.otherAssistsUsed} נרשמו לאחרים · נותר ${limits.assistsLeft} לעדכון`

  return (
    <Box sx={{ display: 'grid', gap: 1, height: '100%', }}>
      {limits.hasGoalUpdates ? (
        <Typography level="body-xs" color="warning" sx={{ px: 0.25, }}>
          כבר קיים עדכון שערים או בישולים למשחק זה
        </Typography>
      ) : null}

      <Box sx={sx.fieldsBlock}>
        <Box sx={sx.booleanGrid}>
          <OnSquadSelector
            value={draft.isSelected}
            onChange={(v) => {
              setField('isSelected', v)
              if (!v) {
                setField('isStarting', false)
                setField('timePlayed', 0)
                setField('goals', 0)
                setField('assists', 0)
              }
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

        <Box sx={sx.statsGrid}>
          <GoalField
            value={draft.goals}
            size="md"
            max={limits.goalsMax}
            onChange={(v) => setField('goals', v)}
            disabled={isFieldsDisabled || !draft.isSelected || goalsLocked}
            helperText={ goalsLocked ? 'לא ניתן להוסיף שערים, כבר קיים עדכון מלא למשחק' : textG }
          />

          <AssistField
            value={draft.assists}
            size="md"
            max={limits.assistsMax}
            onChange={(v) => setField('assists', v)}
            disabled={isFieldsDisabled || !draft.isSelected || assistsLocked}
            helperText={ assistsLocked ? 'לא ניתן להוסיף בישולים, כבר קיים עדכון מלא למשחק' : textA }
          />

          <TimePlayedField
            value={draft.timePlayed}
            size="md"
            max={draft?.raw?.gameDuration}
            onChange={(v) => setField('timePlayed', v)}
            disabled={isFieldsDisabled || !draft.isSelected}
          />
        </Box>
      </Box>
    </Box>
  )
}
