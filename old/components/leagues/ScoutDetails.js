// src/features/playersDatabase/components/leagues/ScoutDetails.js

import React, { useRef, useState } from 'react'
import {
  Box,
  Chip,
  IconButton,
  Typography,
} from '@mui/joy'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'

import {
  SCOUT_PROFILES,
} from '../../../../shared/players/scouting/index.js'
import { ScoutProfileChip } from '../sharedUi/index.js'
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

  return new Set((drilldown?.profiles || []).map(profile => profile.id))
}

const getProfileCount = (team = {}, profileId = '') => {
  const id = String(profileId || '').trim()
  if (!id) return 0

  return (
    Number(team.profileCounts?.[id]) ||
    Number(team.rawProfileCounts?.[id]) ||
    0
  )
}

const getAllProfileCount = (team = {}) => (
  Object.values(team.profileCounts || {})
    .reduce((acc, value) => acc + (Number(value) || 0), 0) ||
  Object.values(team.rawProfileCounts || {})
    .reduce((acc, value) => acc + (Number(value) || 0), 0) ||
  Number(team.scoutProfilesCount) ||
  0
)

export default function ScoutDetails({
  drilldown,
  team,
  teamOptions = [],
  active = false,
  playerSearch,
  onLeagueIndexRefresh,
}) {
  const activeProfileIds = getActiveProfileIds(drilldown)
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const chipsRef = useRef(null)
  const allProfilesCount = getAllProfileCount(team)

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
            <Chip
              size="sm"
              variant={!selectedProfileId ? 'solid' : 'soft'}
              color={!selectedProfileId ? 'primary' : 'neutral'}
              startDecorator={<ManageSearchIcon fontSize="small" />}
              onClick={event => {
                event.stopPropagation()
                setSelectedProfileId('')
              }}
              sx={sx.profileChip(!selectedProfileId)}
            >
              כל הפרופילים {allProfilesCount}
            </Chip>

            {SCOUT_PROFILES.map(profile => {
              const activeProfile = activeProfileIds.has(profile.id)
              const selectedProfile = selectedProfileId === profile.id
              const profileCount = getProfileCount(team, profile.id)

              return (
                <ScoutProfileChip
                  key={profile.id}
                  profileId={profile.id}
                  label={profile.label}
                  iconId={profile.idIcon}
                  count={profileCount}
                  active={activeProfile}
                  selected={selectedProfile}
                  onClick={event => {
                    event.stopPropagation()
                    setSelectedProfileId(current => (
                      current === profile.id ? '' : profile.id
                    ))
                  }}
                  sx={sx.profileChip(selectedProfile || activeProfile)}
                />
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
        activeProfileFilterId={selectedProfileId}
        onLeagueIndexRefresh={onLeagueIndexRefresh}
      />
    </Box>
  )
}
