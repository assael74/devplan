// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueUrlEditor.js

import * as React from 'react'
import { updateLeagueSeasonSettings } from '../../../../services/write/league/edits/updateLeagueSeasonSettings.js'
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
    // Hidden promotion fields in the top league are not an explicit rule edit.
    setRules({ original: draft, draft, saving: false, error: '' })
    setOpen(true)
  }

  const save = async () => {
    if (!open || !context || saving || (!urlDirty && !rulesDirty) || !urlValid || !rulesValid) return
    const submittedUrl = url.draft.trim()
    const submittedRules = rules.draft
    setUrl(current => ({ ...current, saving: true, error: '' }))
    setRules(current => ({ ...current, saving: true, error: '' }))
    let saved = false
    try {
      await updateLeagueSeasonSettings({
        leagueId: context.leagueId,
        seasonId: context.seasonId,
        ...(urlDirty ? { seasonUrl: submittedUrl } : {}),
        ...(rulesDirty ? {
          competitionRules: buildCompetitionRules({
            draft: submittedRules,
            teamCount: context.teamCount,
            isTopLeague: context.isTopLeague,
          }),
        } : {}),
      })
      saved = true
      if (urlDirty) setUrl(current => ({ ...current, original: submittedUrl, draft: submittedUrl }))
      if (rulesDirty) setRules(current => ({ ...current, original: submittedRules }))
      notify({ status: SNACK_STATUS.SUCCESS, title: 'הגדרות עונת הליגה נשמרו' })
    } catch (error) {
      const message = error.message || 'לא התקבל אישור לשמירה'
      if (urlDirty) setUrl(current => ({ ...current, error: message }))
      if (rulesDirty) setRules(current => ({ ...current, error: message }))
      notify({ status: SNACK_STATUS.ERROR, title: 'שמירת הגדרות עונת הליגה נכשלה', message })
    }
    try {
      if (!saved && reload) await reload()
    } catch (error) {
      const message = 'רענון התצוגה נכשל'
      const appendError = current => ({
        ...current,
        error: [current.error, message].filter(Boolean).join('. '),
      })
      if (urlDirty) setUrl(appendError)
      if (rulesDirty) setRules(appendError)
      notify({
        status: SNACK_STATUS.ERROR,
        title: message,
        message: error.message,
      })
    } finally {
      setUrl(current => ({ ...current, saving: false }))
      setRules(current => ({ ...current, saving: false }))
    }
  }

  return {
    open,
    context,
    saving,
    urlError: url.error,
    rulesError: rules.error,
    draftUrl: url.draft,
    draftRules: rules.draft,
    urlDirty,
    rulesDirty,
    urlValid,
    rulesValid,
    show,
    save,
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
