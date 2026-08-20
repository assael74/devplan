// src/features/playersDatabase/ui/components/scout/ScoutStoryChip.js

import * as React from 'react'
import { Box } from '@mui/joy'

import ScoutProfileChip from './ScoutProfileChip.js'
import {
  ScoutStoryList,
  ScoutStoryMetrics,
  ScoutStorySection,
  ScoutStoryText,
} from './ScoutStoryModal.js'
import ScoutStoryModal from './ScoutStoryModal.js'
import { buildScoutCompactView } from './scoutDisplay.model.js'
import { readPlayerScoutMeasurementHistory } from '../../../services/read/index.js'
import {
  buildScoutContextItems,
  buildScoutSpotlightLabel,
  buildScoutStatsLoadHistoryStory,
  buildScoutStatsLoadProgressionStory,
  buildScoutStorySummary,
  buildScoutTransferStory,
  getScoutActionLabel,
  getScoutExposureLabel,
  getScoutProfileLabel,
  getScoutQuestionLabel,
  getScoutStatsLoadTransitionLabel,
  getScoutTrendLabel,
} from '../../logic/scout/scoutStoryDisplay.logic.js'

const clean = value => String(value || '').trim()

const toPctLabel = value => {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return '-'

  const pctValue = Math.abs(numberValue) <= 1
    ? numberValue * 100
    : numberValue

  return `${Math.round(pctValue)}%`
}

const resolvePrimaryProfile = player => {
  const hierarchyProfile = player?.scoutProfileHierarchy?.primarySignal
  if (hierarchyProfile) return hierarchyProfile

  return (Array.isArray(player?.scoutProfiles) ? player.scoutProfiles : [])[0] || null
}

const resolveNearProfile = player => (
  player?.scoutProfileProgression?.nearestProfile ||
  (Array.isArray(player?.scoutCandidateSignals) ? player.scoutCandidateSignals[0] : null) ||
  null
)

const resolveChipLabel = ({ profileView, nearProfile, label }) => {
  if (clean(label)) return clean(label)
  if (clean(profileView?.label)) return clean(profileView.label)
  if (!nearProfile) return ''

  return `קרוב · ${clean(nearProfile.profileLabel) || getScoutProfileLabel(nearProfile.profileId)}`
}

export default function ScoutStoryChip({ player = {}, label = '', fontSize = 11 }) {
  const [open, setOpen] = React.useState(false)
  const [historyReadState, setHistoryReadState] = React.useState({
    key: '',
    events: [],
  })
  const profiles = Array.isArray(player.scoutProfiles) ? player.scoutProfiles : []
  const combinations = Array.isArray(player.scoutCombinations) ? player.scoutCombinations : []
  const profileView = buildScoutCompactView({
    profiles,
    combinations,
    display: player.scoutProfileDisplay || {},
    fallbackLabel: player.profile,
    player,
  })
  const primaryProfile = resolvePrimaryProfile(player)
  const nearProfile = resolveNearProfile(player)
  const chipLabel = resolveChipLabel({
    profileView,
    nearProfile,
    label,
  })
  const isNearProfileOnly = Boolean(
    !profiles.length &&
    !combinations.length &&
    nearProfile
  )
  const opportunity = player.scoutOpportunity || null
  const spotlights = Array.isArray(player.scoutSpotlights)
    ? player.scoutSpotlights
    : Array.isArray(primaryProfile?.spotlights)
      ? primaryProfile.spotlights
      : []
  const verification = player.scoutVerification || null
  const supportingProfileIds = Array.isArray(player?.scoutProfileHierarchy?.supportingProfileIds)
    ? player.scoutProfileHierarchy.supportingProfileIds
    : profiles.slice(1).map(profile => clean(profile.profileId || profile.id)).filter(Boolean)
  const primaryProfileId = clean(primaryProfile?.profileId || primaryProfile?.id)
  const supportingProfileLabels = supportingProfileIds
    .filter(profileId => clean(profileId) !== primaryProfileId)
    .map(getScoutProfileLabel)
  const transferStory = buildScoutTransferStory(
    player.scoutTransferContext || player.scoutTrajectory?.latestTransfer || null
  )
  const storySummary = buildScoutStorySummary({
    primaryProfile,
    opportunity,
    nearProfile,
  })
  const statsLoadProgressionStory = buildScoutStatsLoadProgressionStory(player)
  const localHistory = Array.isArray(player.scoutStatsLoadMeasurementHistory)
    ? player.scoutStatsLoadMeasurementHistory
    : []
  const localHistoryEvents = Array.isArray(player.scoutStatsLoadMeasurementHistoryEvents)
    ? player.scoutStatsLoadMeasurementHistoryEvents
    : []
  const playerDocumentId = clean(player.playerDocumentId || player.identity?.playerDocumentId)
  const teamDocumentId = clean(
    player.team?.teamDocumentId ||
    player.team?.birthTeamDocumentId
  )
  const season = player.season && typeof player.season === 'object'
    ? player.season
    : {}
  const historyReadKey = [
    playerDocumentId,
    clean(season.seasonId),
    clean(season.seasonKey),
    teamDocumentId,
  ].filter(Boolean).join('|')
  const resolvedHistoryEvents = localHistoryEvents.length
    ? localHistoryEvents
    : historyReadState.key === historyReadKey
      ? historyReadState.events
      : []
  const statsLoadHistoryStory = buildScoutStatsLoadHistoryStory({
    ...player,
    scoutStatsLoadMeasurementHistoryEvents: resolvedHistoryEvents,
  })
  const nearProfileMeasurement = statsLoadProgressionStory?.transitions.find(transition => (
    !transition.stale &&
    clean(transition.profileId) === clean(nearProfile?.profileId)
  )) || null

  React.useEffect(() => {
    if (!open || !historyReadKey || localHistory.length || localHistoryEvents.length) {
      return undefined
    }

    if (historyReadState.key === historyReadKey) return undefined

    let active = true

    readPlayerScoutMeasurementHistory({
      playerDocumentId,
      season,
      teamDocumentId,
    })
      .then(result => {
        if (!active) return

        setHistoryReadState({
          key: historyReadKey,
          events: Array.isArray(result?.events) ? result.events : [],
        })
      })
      .catch(() => {
        if (!active) return

        setHistoryReadState({
          key: historyReadKey,
          events: [],
        })
      })

    return () => {
      active = false
    }
  }, [
    historyReadKey,
    historyReadState.key,
    localHistory.length,
    localHistoryEvents.length,
    open,
    playerDocumentId,
    season,
    teamDocumentId,
  ])

  if (!chipLabel) return null

  return (
    <>
      <Box
        component='span'
        role='button'
        tabIndex={0}
        onClick={event => {
          event.stopPropagation()
          setOpen(true)
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.stopPropagation()
            setOpen(true)
          }
        }}
      >
        <ScoutProfileChip
          profileId={profileView.primaryItem?.id || ''}
          label={chipLabel}
          tooltip='פתיחת סיפור סקאוט'
          iconId={isNearProfileOnly
            ? 'search'
            : profileView.primaryItem?.iconId || 'performanceProfile'}
          variant={isNearProfileOnly ? 'nearProfile' : profileView.variant}
          fontSize={fontSize}
        />
      </Box>

      <ScoutStoryModal
        open={open}
        onClose={() => setOpen(false)}
        profileLabel={clean(primaryProfile?.profileLabel || primaryProfile?.label) || chipLabel}
        profileDescription={storySummary}
        profileIconId={isNearProfileOnly
          ? 'search'
          : profileView.primaryItem?.iconId || 'performanceProfile'}
      >
        <ScoutStorySection
          title='למה השחקן מעניין'
          description='המשמעות המקצועית של הפרופיל והפעולה המומלצת כרגע.'
          iconId='performanceProfile'
          emphasis
        >
          <ScoutStoryMetrics
            items={[
              primaryProfile?.profileDepth?.depthPct !== undefined
                ? {
                  id: 'depth',
                  label: 'עומק פרופיל',
                  value: toPctLabel(primaryProfile.profileDepth.depthPct),
                }
                : null,
              opportunity?.effectiveActionStatus
                ? {
                  id: 'opportunity',
                  label: 'המלצת פעולה',
                  value: getScoutActionLabel(opportunity.effectiveActionStatus),
                }
                : null,
              opportunity?.exposureLevel
                ? {
                  id: 'exposure',
                  label: 'חשיפה',
                  value: getScoutExposureLabel(opportunity.exposureLevel),
                }
                : null,
            ].filter(Boolean)}
          />
        </ScoutStorySection>

        {nearProfile ? (
          <ScoutStorySection
            title='קרוב לפרופיל'
            description='הפרופיל הבא שהשחקן מתקרב לרף שלו.'
            iconId='search'
          >
            <ScoutStoryMetrics
              items={[
                {
                  id: 'near-profile',
                  label: 'פרופיל',
                  value: clean(nearProfile.profileLabel) || getScoutProfileLabel(nearProfile.profileId),
                },
                {
                  id: 'near-distance',
                  label: 'מרחק מהרף',
                  value: toPctLabel(nearProfile.distancePct),
                },
                nearProfileMeasurement
                  ? {
                    id: 'near-trend',
                    label: 'מגמה',
                    value: getScoutTrendLabel(nearProfileMeasurement.trend),
                  }
                  : null,
              ].filter(Boolean)}
            />
          </ScoutStorySection>
        ) : null}

        {statsLoadProgressionStory ? (
          <ScoutStorySection
            title='מגמת טעינות סטטיסטיקה'
            description={statsLoadProgressionStory.description}
            iconId='performanceProfile'
          >
            <ScoutStoryMetrics
              items={statsLoadProgressionStory.primaryTransition
                ? [
                    {
                      id: 'stats-load-profile',
                      label: 'פרופיל נמדד',
                      value: getScoutProfileLabel(
                        statsLoadProgressionStory.primaryTransition.profileId
                      ),
                    },
                    {
                      id: 'stats-load-trend',
                      label: 'מגמה',
                      value: statsLoadProgressionStory.primaryTransition.stale
                        ? 'היסטורית · לא פעילה'
                        : getScoutStatsLoadTransitionLabel(
                            statsLoadProgressionStory.primaryTransition
                          ),
                    },
                  ]
                : []}
            />

            <ScoutStoryList
              items={statsLoadProgressionStory.transitions.slice(0, 3).map(transition => ({
                id: `stats-load-${transition.profileId}`,
                label: transition.stale
                  ? `${transition.label} — מדידה היסטורית, לא פעילה כרגע.`
                  : transition.label,
              }))}
            />

            {statsLoadProgressionStory.staleTransitions.length ? (
              <ScoutStoryText>
                {statsLoadProgressionStory.staleNote}
              </ScoutStoryText>
            ) : null}
          </ScoutStorySection>
        ) : null}

        {statsLoadHistoryStory ? (
          <ScoutStorySection
            title='רצף היסטורי'
            description={statsLoadHistoryStory.description}
            iconId='performanceProfile'
          >
            <ScoutStoryList items={statsLoadHistoryStory.items} />
          </ScoutStorySection>
        ) : null}

        {transferStory ? (
          <ScoutStorySection
            title='מעבר קבוצה'
            description='האם המעבר שדרג את סביבת השחקן ומה השתנה אחריו.'
            iconId='team'
            emphasis
          >
            <ScoutStoryText>{transferStory.title}</ScoutStoryText>
            <ScoutStoryList items={transferStory.items} />
          </ScoutStorySection>
        ) : null}

        <ScoutStorySection
          title='ההקשר המקצועי'
          description='איך הקבוצה, רמת התחרות והעמדה משפיעות על משמעות הפרופיל.'
          iconId='team'
        >
          <ScoutStoryList items={buildScoutContextItems(primaryProfile)} />
        </ScoutStorySection>

        <ScoutStorySection
          title='נקודות שמוסיפות עומק'
          description='סיגנלים נוספים שעוזרים להבין את הפרופיל מעבר למספרים הבסיסיים.'
          iconId='performanceProfile'
        >
          <ScoutStoryList
            items={spotlights.map(spotlight => ({
              id: clean(spotlight.id),
              label: buildScoutSpotlightLabel(spotlight),
            }))}
          />
        </ScoutStorySection>

        <ScoutStorySection
          title='פרופילים נוספים'
          description='פרופילים נוספים שמחזקים או משלימים את התמונה המקצועית.'
          iconId='layers'
        >
          <ScoutStoryList items={supportingProfileLabels} />
        </ScoutStorySection>

        {verification?.nextBestCheck ? (
          <ScoutStorySection
            title='מה כדאי לבדוק עכשיו'
            description='הבדיקה הבאה שתוסיף הכי הרבה ודאות להערכת השחקן.'
            iconId='check'
          >
            <ScoutStoryText>
              {getScoutQuestionLabel(verification.nextBestCheck)}
            </ScoutStoryText>
          </ScoutStorySection>
        ) : null}
      </ScoutStoryModal>
    </>
  )
}
