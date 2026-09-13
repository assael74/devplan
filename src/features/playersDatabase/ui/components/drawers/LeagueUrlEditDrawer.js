// src/features/playersDatabase/ui/components/drawers/LeagueUrlEditDrawer.js

import * as React from 'react'
import { Box, FormControl, FormHelperText, FormLabel, Input } from '@mui/joy'

import DrawerShell from '../../../../../ui/patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../../../ui/patterns/drawer/DrawerHeaderShell.js'
import { entitySeasonUrlDrawerSx as sx } from './sx/entitySeasonUrlDrawer.sx.js'

const clean = value => String(value || '').trim()
const isValidUrl = value => !clean(value) || /^https?:\/\/[^\s]+$/i.test(clean(value))
const toQuantity = value => {
  if (value === '' || value === null || value === undefined) return 0
  const quantity = Number(value)
  return Number.isInteger(quantity) && quantity >= 0 ? quantity : null
}
const toQuantityText = places => String(Array.isArray(places) ? places.length : 0)
const isValidQuantity = value => toQuantity(value) !== null
const buildTopPlaces = ({ quantity, start = 1 } = {}) => Array.from(
  { length: toQuantity(quantity) || 0 },
  (_, index) => start + index
)
const buildRelegationPlaces = ({ teamCount, directQuantity, playoffQuantity } = {}) => {
  const teams = Math.max(0, Number(teamCount) || 0)
  const direct = Math.min(teams, toQuantity(directQuantity) || 0)
  const playoff = Math.min(Math.max(0, teams - direct), toQuantity(playoffQuantity) || 0)

  return {
    directPlaces: buildTopPlaces({ quantity: direct, start: teams - direct + 1 }),
    playoffPlaces: buildTopPlaces({ quantity: playoff, start: teams - direct - playoff + 1 }),
  }
}
const buildCompetitionRules = ({ draft, teamCount, isTopLeague } = {}) => {
  const promotionDirectPlaces = isTopLeague
    ? []
    : buildTopPlaces({ quantity: draft?.promotionDirectPlaces })
  const promotionPlayoffPlaces = isTopLeague
    ? []
    : buildTopPlaces({
        quantity: draft?.promotionPlayoffPlaces,
        start: promotionDirectPlaces.length + 1,
      })
  const relegation = buildRelegationPlaces({
    teamCount,
    directQuantity: draft?.relegationDirectPlaces,
    playoffQuantity: draft?.relegationPlayoffPlaces,
  })

  return {
    configured: Boolean(
      promotionDirectPlaces.length || promotionPlayoffPlaces.length ||
      relegation.directPlaces.length || relegation.playoffPlaces.length
    ),
    promotion: { directPlaces: promotionDirectPlaces, playoffPlaces: promotionPlayoffPlaces },
    relegation,
  }
}
const readCurrentRules = rules => ({
  configured: Boolean(rules?.configured),
  promotion: {
    directPlaces: Array.isArray(rules?.promotion?.directPlaces) ? rules.promotion.directPlaces : [],
    playoffPlaces: Array.isArray(rules?.promotion?.playoffPlaces) ? rules.promotion.playoffPlaces : [],
  },
  relegation: {
    directPlaces: Array.isArray(rules?.relegation?.directPlaces) ? rules.relegation.directPlaces : [],
    playoffPlaces: Array.isArray(rules?.relegation?.playoffPlaces) ? rules.relegation.playoffPlaces : [],
  },
})
const buildDraft = season => ({
  seasonUrl: clean(season?.seasonUrl),
  promotionDirectPlaces: toQuantityText(season?.competitionRules?.promotion?.directPlaces),
  promotionPlayoffPlaces: toQuantityText(season?.competitionRules?.promotion?.playoffPlaces),
  relegationDirectPlaces: toQuantityText(season?.competitionRules?.relegation?.directPlaces),
  relegationPlayoffPlaces: toQuantityText(season?.competitionRules?.relegation?.playoffPlaces),
})
const serializeDraft = draft => JSON.stringify({
  seasonUrl: clean(draft.seasonUrl),
  promotionDirectPlaces: toQuantity(draft.promotionDirectPlaces),
  promotionPlayoffPlaces: toQuantity(draft.promotionPlayoffPlaces),
  relegationDirectPlaces: toQuantity(draft.relegationDirectPlaces),
  relegationPlayoffPlaces: toQuantity(draft.relegationPlayoffPlaces),
})

export default function LeagueUrlEditDrawer({
  league,
  season,
  open,
  saving,
  onClose,
  onSave,
}) {
  const originalDraft = React.useMemo(() => buildDraft(season?.season), [season?.season])
  const [draft, setDraft] = React.useState(originalDraft)

  React.useEffect(() => {
    if (open) setDraft(originalDraft)
  }, [open, originalDraft])

  const valid = isValidUrl(draft.seasonUrl) && [
    draft.promotionDirectPlaces,
    draft.promotionPlayoffPlaces,
    draft.relegationDirectPlaces,
    draft.relegationPlayoffPlaces,
  ].every(isValidQuantity)
  const isTopLeague = Number(league?.level) === 1
  const teamCount = Array.isArray(season?.season?.tableRank) ? season.season.tableRank.length : 0
  const nextRules = buildCompetitionRules({ draft, teamCount, isTopLeague })
  const currentRules = readCurrentRules(season?.season?.competitionRules)
  const rulesChanged = JSON.stringify(nextRules) !== JSON.stringify(currentRules)
  const isDirty = serializeDraft(draft) !== serializeDraft(originalDraft) || rulesChanged
  const canSave = valid && isDirty && !saving
  const updateField = field => event => setDraft(current => ({ ...current, [field]: event.target.value }))
  const save = () => {
    if (!canSave) return
    const changes = {}
    if (clean(draft.seasonUrl) !== clean(originalDraft.seasonUrl)) {
      changes.seasonUrl = clean(draft.seasonUrl)
    }
    if (rulesChanged) {
      changes.competitionRules = nextRules
    }
    onSave(changes)
  }
  const fields = [
    ['promotionDirectPlaces', 'כמות עולות ישירות'],
    ['promotionPlayoffPlaces', 'כמות עולות לפלייאוף'],
    ['relegationDirectPlaces', 'כמות יורדות ישירות'],
    ['relegationPlayoffPlaces', 'כמות יורדות לפלייאוף'],
  ]

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      entity='league'
      saving={saving}
      isDirty={isDirty}
      canSave={canSave}
      sxOverrides={sx.shell}
      header={(
        <DrawerHeaderShell
          title='הגדרות וקישור עונת ליגה'
          titleIconId='link'
          entity='league'
          subline={league?.name || league?.leagueName || ''}
          meta={season?.seasonKey ? `עונה ${season.seasonKey}` : ''}
          metaIconId='season'
          chipLabel='מאגר שחקנים'
          chipIconId='playersDatabase'
          sxOverrides={sx.header}
        />
      )}
      actions={{ onSave: save, onReset: () => setDraft(originalDraft) }}
      texts={{
        save: 'שמירת הגדרות',
        saving: 'שומר ומרענן מועדונים...',
        statusSaving: 'מעדכן הגדרות והשלכות...',
        statusDirty: 'יש שינוי שטרם נשמר',
        statusClean: 'לא בוצעו שינויים',
      }}
      saveButtonProps={{ sx: sx.saveButton }}
      cancelButtonProps={{ sx: sx.cancelButton }}
      resetButtonProps={{ sx: sx.resetButton }}
    >
      <Box sx={sx.fieldCard}>
        <FormControl error={!isValidUrl(draft.seasonUrl)} sx={sx.formControl}>
          <FormLabel>קישור הליגה לעונה</FormLabel>
          <Input autoFocus autoComplete='off' value={draft.seasonUrl} placeholder='https://'
            onChange={updateField('seasonUrl')} slotProps={{ input: { dir: 'ltr' } }} sx={sx.input} />
          <FormHelperText>אפשר להשאיר ריק או להזין כתובת מלאה.</FormHelperText>
        </FormControl>
        <Box sx={[sx.goalGrid, { mt: 2 }]}>
          {fields.map(([field, label]) => (
            <FormControl key={field} error={!isValidQuantity(draft[field])} sx={sx.formControl}>
              <FormLabel>{label}</FormLabel>
              <Input type='number' min={0} value={draft[field]} placeholder='0' onChange={updateField(field)}
                disabled={isTopLeague && field.startsWith('promotion')}
                slotProps={{ input: { inputMode: 'numeric', dir: 'ltr' } }} sx={sx.input} />
              <FormHelperText>
                {isTopLeague && field.startsWith('promotion')
                  ? 'בליגה הראשונה אין עלייה.'
                  : 'הזן את מספר הקבוצות.'}
              </FormHelperText>
            </FormControl>
          ))}
        </Box>
      </Box>
    </DrawerShell>
  )
}
