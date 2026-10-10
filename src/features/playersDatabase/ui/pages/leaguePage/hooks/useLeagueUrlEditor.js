// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueUrlEditor.js

import * as React from 'react'
import { updateLeagueSeasonUrl } from '../../../../services/write/league/edits/updateLeagueSeasonUrl.js'
import { updateLeagueCompetitionRules } from '../../../../services/write/league/edits/updateLeagueCompetitionRules.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import {
  buildCompetitionRules,
  buildRulesDraft,
  serializeRulesDraft,
  isValidQuantity,
  isValidSeasonUrl,
} from '../logic/leagueSettingsEditor.model.js'

export default function useLeagueUrlEditor({
  league,
  selectedSeasonOption,
  notify,
  reload,
}) {
  const [open, setOpen] = React.useState(false)
  const [context, setContext] = React.useState(null)
  const [url, setUrl] = React.useState({
    original: '',
    draft: '',
    saving: false,
    error: '',
  })
  const [rules, setRules] = React.useState({
    original: {},
    draft: {},
    saving: false,
    error: '',
  })
  const saving = url.saving || rules.saving
  const urlDirty = url.draft.trim() !== url.original
  const rulesDirty =
    serializeRulesDraft(rules.draft) !== serializeRulesDraft(rules.original)
  const urlValid = isValidSeasonUrl(url.draft)
  const rulesValid = Object.values(rules.draft).every(isValidQuantity)

  const show = () => {
    if (saving || !selectedSeasonOption) return
    const season = selectedSeasonOption.season || {}
    const seasonUrl = String(season.seasonUrl || '').trim()
    const originalRules = buildRulesDraft(season)
    const isTopLeague = Number(league.level) === 1
    const draft = isTopLeague
      ? { ...originalRules, promotionDirectPlaces: '0', promotionPlayoffPlaces: '0' }
      : originalRules
    setContext({
      leagueId: league.id,
      leagueName: league.name || league.leagueName || '',
      seasonKey: selectedSeasonOption.seasonKey,
      seasonId: selectedSeasonOption.seasonId,
      isTopLeague,
      teamCount: Object.keys(season.table?.teamsById || {}).length,
    })
    setUrl({ original: seasonUrl, draft: seasonUrl, saving: false, error: '' })
    setRules({ original: originalRules, draft, saving: false, error: '' })
    setOpen(true)
  }

  // Only the selected section is updated. Recovery reload runs only after a failed write.
  const saveSection = async ({ write, setSection, submitted, label }) => {
    setSection(current => ({ ...current, saving: true, error: '' }))
    let saved = false
    try {
      await write()
      saved = true
      setSection(current => ({ ...current, original: submitted }))
      notify({ status: SNACK_STATUS.SUCCESS, title: `${label} נשמרו` })
    } catch (error) {
      const message = error.message || 'לא התקבל אישור לשמירה'
      setSection(current => ({ ...current, error: message }))
      notify({ status: SNACK_STATUS.ERROR, title: `שמירת ${label} נכשלה`, message })
    }
    try {
      if (!saved && reload) await reload()
    } catch (error) {
      const message = 'רענון התצוגה נכשל'
      setSection(current => ({
        ...current,
        error: [current.error, message].filter(Boolean).join('. '),
      }))
      notify({
        status: SNACK_STATUS.ERROR,
        title: `${label}: ${message}`,
        message: error.message,
      })
    } finally {
      setSection(current => ({ ...current, saving: false }))
    }
  }

  const saveUrl = async (value = url.draft) => {
    const submitted = String(value || '').trim()
    if (!open || !context || saving || submitted === url.original || !isValidSeasonUrl(submitted)) return
    setUrl(current => ({ ...current, draft: submitted }))
    await saveSection({
      write: () =>
        updateLeagueSeasonUrl({
          leagueId: context.leagueId,
          seasonId: context.seasonId,
          seasonUrl: submitted,
        }),
      setSection: setUrl,
      submitted,
      label: 'פרטי הקישור',
    })
  }

  const saveRules = async () => {
    if (!open || !context || saving || !rulesDirty || !rulesValid) return
    const submitted = rules.draft
    await saveSection({
      write: () =>
        updateLeagueCompetitionRules({
          leagueId: context.leagueId,
          seasonId: context.seasonId,
          competitionRules: buildCompetitionRules({
            draft: submitted,
            teamCount: context.teamCount,
            isTopLeague: context.isTopLeague,
          }),
        }),
      setSection: setRules,
      submitted,
      label: 'חוקי התחרות',
    })
  }

  return {
    open,
    context,
    saving,
    urlSaving: url.saving,
    rulesSaving: rules.saving,
    urlError: url.error,
    rulesError: rules.error,
    draftUrl: url.draft,
    draftRules: rules.draft,
    urlDirty,
    rulesDirty,
    urlValid,
    rulesValid,
    show,
    saveUrl,
    saveRules,
    changeUrl: value => {
      if (!saving) setUrl(current => ({ ...current, draft: value, error: '' }))
    },
    changeRule: (field, value) => {
      if (!saving)
        setRules(current => ({
          ...current,
          draft: { ...current.draft, [field]: value },
          error: '',
        }))
    },
    close: () => {
      if (!saving) setOpen(false)
    },
  }
}
