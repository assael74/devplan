// src/features/playersDatabase/ui/pages/playerPage/hooks/usePlayerScoutReview.js

import * as React from 'react'

import {
  PLAYERS_DATABASE_WRITE_ACTIONS,
  runPlayersDatabaseWriteAction,
} from '../../../../services/write/index.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { SCOUT_REVIEW } from '../../../../../../shared/scouting/players/ids.js'

const cloneValue = value => JSON.parse(JSON.stringify(value || {}))


const buildProfileRelevanceIssues = player => {
  const profiles = Array.isArray(player?.activeSeason?.scout?.profiles)
    ? player.activeSeason.scout.profiles
    : []

  return profiles
    .filter(profile => (
      Array.isArray(profile?.requiredReview) &&
      profile.requiredReview.includes(SCOUT_REVIEW.PROFILE_RELEVANCE)
    ))
    .map(profile => ({
      profileId: String(profile?.id || profile?.profileId || '').trim(),
      profileLabel: String(profile?.label || profile?.profileLabel || '').trim(),
      positionEvidence: String(profile?.scoutContext?.position?.evidence || '').trim(),
      requiredContext: String(profile?.positionContext || '').trim(),
    }))
    .filter(issue => issue.profileId)
}

const buildInitialDraft = player => {
  const activeSeason = player?.activeSeason || {}
  const scout = activeSeason.scout || {}
  const manualDecision = scout.opportunity?.manualDecision || {}

  return {
    review: cloneValue(scout.playerReview || {}),
    manualDecision: {
      actionStatus: manualDecision.actionStatus || '',
      reason: manualDecision.reason || '',
      note: manualDecision.note || '',
      seasonKey: manualDecision.seasonKey || activeSeason.season?.seasonKey || '',
      profileIds: Array.isArray(manualDecision.profileIds)
        ? manualDecision.profileIds
        : [],
    },
  }
}

const buildWritePayload = ({ player, draft }) => {
  const activeSeason = player?.activeSeason || {}
  const season = activeSeason.season || {}
  const team = activeSeason.team || {}
  const scout = activeSeason.scout || {}
  const stats = activeSeason.stats?.actual || {}
  const profiles = Array.isArray(scout.profiles) ? scout.profiles : []

  return {
    target: activeSeason.lifecycle?.type || 'current',
    league: {
      id: team.leagueId || '',
    },
    season: {
      ...season,
      seasonId: season.seasonId || season.seasonKey || '',
      seasonKey: season.seasonKey || season.seasonId || '',
      leagueId: team.leagueId || season.leagueId || '',
      leagueLevel: team.leagueLevel || season.leagueLevel || 0,
      ageGroupId: team.ageGroupId || season.ageGroupId || '',
      ageGroupLabel: team.ageGroupLabel || season.ageGroupLabel || '',
      birthYear: season.birthYear || player.birthYear || null,
    },
    team: {
      ...team,
      id: team.teamId || '',
      teamId: team.teamId || '',
      birthTeamId: team.teamId || '',
      teamDocumentId: team.teamDocumentId || team.teamId || '',
      birthTeamDocumentId: team.teamDocumentId || team.teamId || '',
    },
    player: {
      ...(activeSeason.identity || {}),
      playerId: player.playerId || player.id || '',
      playerDocumentId: player.id || player.playerId || '',
      externalPlayerId: player.externalPlayerId || activeSeason.identity?.externalPlayerId || '',
      fullName: player.fullName || activeSeason.identity?.displayName || '',
      birthYear: player.birthYear || season.birthYear || null,
      playerStats: stats,
      statsStatus: activeSeason.statsStatus || '',
      primaryPosition: activeSeason.position?.primary || '',
      positionLayer: activeSeason.position?.layer || '',
      numShirt: activeSeason.position?.shirtNumber || '',
      scoutProfiles: profiles,
      scoutSignals: profiles,
      scoutCombinations: Array.isArray(scout.combinations) ? scout.combinations : [],
      scoutCandidateSignals: Array.isArray(scout.candidateSignals) ? scout.candidateSignals : [],
      scoutOpportunity: scout.opportunity || null,
      scoutProfileCaseStrength: scout.profileCaseStrength || null,
      scoutProfileProgression: scout.profileProgression || null,
    },
    reviewPatch: draft.review || {},
    manualImmediacyDecision: {
      ...(draft.manualDecision || {}),
      seasonKey: season.seasonKey || '',
      profileIds: profiles
        .map(profile => profile?.id || profile?.profileId || '')
        .filter(Boolean),
    },
  }
}

export default function usePlayerScoutReview({ player, notify, reload }) {
  const [draft, setDraft] = React.useState(null)
  const [initialDraft, setInitialDraft] = React.useState(null)
  const [saving, setSaving] = React.useState(false)
  const profileRelevanceIssues = React.useMemo(() => buildProfileRelevanceIssues(player), [player])

  const open = React.useCallback(() => {
    const nextDraft = buildInitialDraft(player)

    setDraft(nextDraft)
    setInitialDraft(nextDraft)
  }, [player])

  const close = React.useCallback(() => {
    if (saving) return
    setDraft(null)
    setInitialDraft(null)
  }, [saving])

  const changed = React.useMemo(() => (
    Boolean(draft && initialDraft) &&
    JSON.stringify(draft) !== JSON.stringify(initialDraft)
  ), [draft, initialDraft])

  const save = React.useCallback(async () => {
    if (!draft || saving) return

    const manualDecision = draft.manualDecision || {}

    if (manualDecision.actionStatus && !String(manualDecision.reason || '').trim()) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'נדרשת סיבה להחלטה הידנית',
        message: 'הוסף הסבר קצר לפני השמירה.',
      })
      return
    }

    setSaving(true)

    try {
      const result = await runPlayersDatabaseWriteAction({
        actionType: PLAYERS_DATABASE_WRITE_ACTIONS.UPDATE_PLAYER_SCOUT_REVIEW,
        payload: buildWritePayload({ player, draft }),
      })

      if (result?.projectionError) {
        notify({
          status: SNACK_STATUS.ERROR,
          title: 'הבדיקה נשמרה',
          message: 'עדכון ה־SearchIndex לא הושלם ויידרש סנכרון.',
        })
      } else {
        notify({
          status: SNACK_STATUS.SUCCESS,
          title: 'בדיקת השחקן נשמרה',
          message: player.fullName || '',
        })
      }

      setDraft(null)
      setInitialDraft(null)
      reload()
    } catch (error) {
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'שמירת בדיקת השחקן נכשלה',
        message: error?.message || 'שגיאה בעדכון Player Review',
      })
    } finally {
      setSaving(false)
    }
  }, [draft, notify, player, reload, saving])

  return {
    open,
    close,
    save,
    draft,
    setDraft,
    saving,
    changed,
    seasonKey: player?.activeSeason?.season?.seasonKey || '',
    profileRelevanceIssues,
  }
}
