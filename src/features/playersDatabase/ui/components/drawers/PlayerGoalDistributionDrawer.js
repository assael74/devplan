import * as React from 'react'
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { entitySeasonUrlDrawerSx as sx } from './sx/entitySeasonUrlDrawer.sx.js'

const toNonNegativeInteger = value => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null
}

const toDisplayNumber = value => String(toNonNegativeInteger(value) || 0)

export default function PlayerGoalDistributionDrawer({
  open,
  playerName = '',
  seasonLabel = '',
  seasonGoals = 0,
  seasonGames = 0,
  value,
  saving = false,
  onClose,
  onSave,
}) {
  const originalScoringGames = toNonNegativeInteger(value?.scoringGames)
  const [scoringGames, setScoringGames] = React.useState(originalScoringGames)
  const goals = toNonNegativeInteger(seasonGoals) || 0
  const games = toNonNegativeInteger(seasonGames) || 0

  React.useEffect(() => {
    if (open) setScoringGames(originalScoringGames)
  }, [open, originalScoringGames])

  const valid = scoringGames === null || (
    scoringGames <= games && scoringGames <= goals
  )
  const distributionPct = scoringGames === null || !games
    ? null
    : Math.round((scoringGames / games) * 100)
  const isDirty = scoringGames !== originalScoringGames
  const canSave = isDirty && valid && !saving

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      entity='player'
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      sxOverrides={sx.shell}
      header={(
        <DrawerHeaderShell
          title='מידע נוסף · פיזור שערים'
          titleIconId='goals'
          entity='player'
          subline={playerName}
          meta={seasonLabel ? `עונה ${seasonLabel}` : ''}
          metaIconId='season'
          chipLabel='מאגר שחקנים'
          chipIconId='playersDatabase'
          sxOverrides={sx.header}
        />
      )}
      actions={{
        onSave: () => canSave && onSave({ scoringGames }),
        onReset: () => setScoringGames(originalScoringGames),
      }}
      texts={{
        save: 'שמירת פיזור שערים',
        saving: 'שומר...',
        statusSaving: 'מעדכן נתוני עונה...',
        statusDirty: 'יש שינוי שטרם נשמר',
        statusClean: 'לא בוצעו שינויים',
      }}
      saveButtonProps={{ sx: sx.saveButton }}
      cancelButtonProps={{ sx: sx.cancelButton }}
      resetButtonProps={{ sx: sx.resetButton }}
    >
      <Box sx={sx.fieldCard}>
        <Box sx={sx.goalGrid}>
          <FormControl sx={[sx.formControl, { minWidth: 0 }]}>
            <FormLabel>שערים בעונה</FormLabel>
            <Input value={toDisplayNumber(goals)} readOnly sx={sx.input} />
          </FormControl>
          <FormControl sx={[sx.formControl, { minWidth: 0 }]}>
            <FormLabel>הופעות בעונה</FormLabel>
            <Input value={toDisplayNumber(games)} readOnly sx={sx.input} />
          </FormControl>
        </Box>

        <FormControl error={!valid} sx={[sx.formControl, { mt: 2 }]}>
          <FormLabel>משחקים שבהם השחקן כבש</FormLabel>
          <Input
            type='number'
            slotProps={{ input: { min: 0, max: Math.min(goals, games) } }}
            value={scoringGames === null ? '' : String(scoringGames)}
            placeholder='0'
            onChange={event => setScoringGames(toNonNegativeInteger(event.target.value))}
            sx={sx.input}
          />
          <FormHelperText>
            {!valid
              ? `הערך לא יכול לעלות על ${Math.min(goals, games)}.`
              : 'הנתון מוזן ידנית עבור העונה הנבחרת.'}
          </FormHelperText>
        </FormControl>

        <Box sx={sx.goalSummary}>
          <Typography level='body-xs' sx={sx.goalSummaryLabel}>
            אחוז פיזור שערים
          </Typography>
          <Typography level='title-lg' sx={sx.goalSummaryValue}>
            {distributionPct === null ? '—' : `${distributionPct}%`}
          </Typography>
        </Box>
      </Box>
    </DrawerShell>
  )
}
