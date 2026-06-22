// src/features/playersDatabase/components/leagues/page/ScoutDetails.js

import React, { useRef } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/joy'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

import {
  SCOUT_PROFILES,
  TEAM_FILTER,
} from '../../../../../shared/players/scouting/index.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import TeamPlayers from './players/TeamPlayers.js'
import { detailsSx as sx } from './sx/details.sx.js'

const getActiveProfileIds = drilldown => {
  const settings = drilldown?.settings || {}
  const hasActiveSearch = Boolean(
    settings.includeUniversal ||
    (
      settings.attackPerformanceThreshold !== null &&
      settings.attackPerformanceThreshold !== undefined
    ) ||
    (
      settings.defensePerformanceThreshold !== null &&
      settings.defensePerformanceThreshold !== undefined
    )
  )

  if (!hasActiveSearch) return new Set()

  if (drilldown?.settings?.includeUniversal) {
    return new Set(SCOUT_PROFILES.map(profile => profile.id))
  }

  return new Set(
    (drilldown?.profiles || []).map(profile => profile.id)
  )
}

const pct = value => `${Math.round(Number(value) * 100)}%`

const ruleText = rule => {
  if (rule.metric === 'subInPct') return `כניסות מהספסל לפחות ${pct(rule.value)}`
  if (rule.metric === 'isYoungerAgeGroup') return 'משחק בשנתון גבוה ממנו או קיבל דקות כמוקפץ'
  if (rule.metric === 'startsPct') return `פותח לפחות ${pct(rule.value)} מהמשחקים`
  if (rule.metric === 'subOut') return 'לא מוחלף החוצה'
  if (rule.metric === 'minutesPct') return `משחק לפחות ${pct(rule.value)} מהדקות`
  if (rule.metric === 'yellowCards') return `צהובים בין ${rule.min} ל-${rule.max}`
  if (rule.metric === 'goalsShareOfTeam') return `אחראי לפחות ל-${pct(rule.value)} משערי הקבוצה`
  if (rule.metric === 'goalsPer90') return `לפחות ${rule.value} שערים ל-90 דקות`

  if (rule.metric === 'goals' && rule.op === 'gte') {
    return `לפחות ${rule.value} שערים`
  }

  if (rule.metric === 'goals' && rule.op === 'between') {
    return `${rule.min}-${rule.max} שערים`
  }

  return rule.reason || rule.metric
}

const teamFilterText = teamFilter => {
  if (teamFilter === TEAM_FILTER.ANY) return 'לא תלוי בביצוע קבוצתי. נדלק דרך חיפוש כללי.'
  if (teamFilter === TEAM_FILTER.ANY_POSITIVE) return 'דורש התאמה באחד מספי הביצוע: התקפה או הגנה.'
  if (teamFilter === TEAM_FILTER.DEFENSE_POSITIVE) return 'דורש התאמה בסף הביצוע ההגנתי.'
  if (teamFilter === TEAM_FILTER.CLEAR_POSITIVE) return 'דורש ביצוע קבוצתי חיובי מובהק.'

  return teamFilter || ''
}

function ProfileTooltip({ profile, active }) {
  const rules = Array.isArray(profile.rules) ? profile.rules : []
  const deepRules = Array.isArray(profile.deepRules) ? profile.deepRules : []

  return (
    <Box sx={sx.tooltip}>
      <Typography level="title-sm" sx={sx.tooltipTitle}>
        {profile.label}
      </Typography>

      <Typography level="body-xs" sx={sx.tooltipLine}>
        מצב: {active ? 'פעיל לפי הסינון הנוכחי' : 'כבוי לפי הסינון הנוכחי'}
      </Typography>

      <Typography level="body-xs" sx={sx.tooltipLine}>
        הקשר קבוצתי: {teamFilterText(profile.teamFilter)}
      </Typography>

      <Typography level="body-xs" sx={sx.tooltipLine}>
        קריטריונים: {rules.map(ruleText).join(' + ') || 'ללא קריטריון מספרי'}
      </Typography>

      {deepRules.length ? (
        <Typography level="body-xs" sx={sx.tooltipLine}>
          שתי ליגות מתחת: {deepRules.map(ruleText).join(' + ')}
        </Typography>
      ) : null}
    </Box>
  )
}

export default function ScoutDetails({
  drilldown,
  team,
  teamOptions = [],
  active = false,
  playerSearch,
  onLeagueIndexRefresh,
}) {
  const activeProfileIds = getActiveProfileIds(drilldown)
  const chipsRef = useRef(null)

  const scrollProfiles = (event, direction) => {
    event.stopPropagation()
    chipsRef.current?.scrollBy({
      left: direction * 280,
      behavior: 'smooth',
    })
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.profiles}>
        <Box sx={sx.header}>
          <Typography level="title-sm" sx={sx.title}>
            פרופילי שחקנים
          </Typography>

          <Typography level="body-xs" sx={sx.meta}>
            {activeProfileIds.size}/{SCOUT_PROFILES.length} פעילים
          </Typography>
        </Box>

        <Box sx={sx.chipsRow}>
          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            onClick={event => scrollProfiles(event, 1)}
            sx={sx.chipsScrollButton}
          >
            <KeyboardArrowRightIcon fontSize="small" />
          </IconButton>

          <Box ref={chipsRef} sx={sx.chips}>
            {SCOUT_PROFILES.map(profile => {
              const activeProfile = activeProfileIds.has(profile.id)

              return (
                <Tooltip
                  key={profile.id}
                  arrow
                  placement="top"
                  variant="outlined"
                  title={(
                    <ProfileTooltip
                      profile={profile}
                      active={activeProfile}
                    />
                  )}
                >
                  <Chip
                    size="sm"
                    variant={activeProfile ? 'solid' : 'soft'}
                    color={activeProfile ? 'success' : 'neutral'}
                    startDecorator={iconUi({
                      id: profile.idIcon,
                      size: 'small',
                    })}
                    sx={sx.profileChip(activeProfile)}
                  >
                    {profile.label}
                  </Chip>
                </Tooltip>
              )
            })}
          </Box>

          <IconButton
            size="sm"
            variant="soft"
            color="neutral"
            onClick={event => scrollProfiles(event, -1)}
            sx={sx.chipsScrollButton}
          >
            <KeyboardArrowLeftIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <TeamPlayers
        team={team}
        teamOptions={teamOptions}
        active={active}
        playerSearch={playerSearch}
        onLeagueIndexRefresh={onLeagueIndexRefresh}
      />
    </Box>
  )
}
