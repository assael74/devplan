// src/features/playersDatabase/ui/pages/leaguePage/hooks/useLeagueUrlEditor.js

import * as React from 'react'
import { updateLeagueSeasonUrl } from '../../../../services/writeV2/edits/league/updateSeasonUrl.js'
import { updateLeagueCompetitionRules } from '../../../../services/writeV2/edits/league/updateCompetitionRules.js'
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
    const draft = buildRulesDraft(season)
    setContext({
      leagueId: league.id,
      leagueName: league.name || league.leagueName || '',
      seasonKey: selectedSeasonOption.seasonKey,
      isTopLeague: Number(league.level) === 1,
      teamCount: Array.isArray(season.tableRank) ? season.tableRank.length : 0,
    })
    setUrl({ original: seasonUrl, draft: seasonUrl, saving: false, error: '' })
    setRules({ original: draft, draft, saving: false, error: '' })
    setOpen(true)
  }

  // Only the selected section is updated. Reload must not reset the other draft.
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
      await reload()
    } catch (error) {
      const message = saved ? 'השמירה הצליחה; רענון התצוגה נכשל' : 'רענון התצוגה נכשל'
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

  const saveUrl = async () => {
    if (!open || !context || saving || !urlDirty || !urlValid) return
    const submitted = url.draft.trim()
    await saveSection({
      write: () =>
        updateLeagueSeasonUrl({
          leagueId: context.leagueId,
          seasonKey: context.seasonKey,
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
          seasonKey: context.seasonKey,
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
