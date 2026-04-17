import React from 'react'
import { Box, Chip, Divider, Tooltip, Typography, Avatar } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import roleImage from '../../../../../../../ui/core/images/roleImage.png'
import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { previewSx as sx } from '../sx/contextView.sx.js'
import { TypeChip, SquadRoleChip, LevelStars, PrivateChip } from '../parts/MetaChips.js'

function getTeamCoach(team) {
  const roles = Array.isArray(team?.roles) ? team.roles : []
  return roles.find((role) => String(role?.type || '').trim() === 'coach') || null
}

function wrapItem(key, node) {
  if (!node) return null
  return { key, node }
}

function buildDividerItem(key) {
  return wrapItem(key, <Divider orientation="vertical" />)
}

function buildLeagueChipItem(team) {
  const league = String(team?.league || '').trim()
  const leagueLevel = String(team?.leagueLevel || '').trim()
  const leaguePosition = String(team?.leaguePosition || '').trim()
  const points = String(team?.points || '').trim()

  if (!league) return null

  const leagueLab = leagueLevel ? `${league} (${leagueLevel})` : league

  const tipParts = [
    `הקבוצה משחקת בליגת ${league}`,
    leaguePosition ? `ממוקמת במקום ${leaguePosition}` : '',
    points ? `עם ${points} נקודות` : '',
  ].filter(Boolean)

  const tipText = tipParts.join(' · ')

  return wrapItem(
    'league',
    <Tooltip title={tipText} arrow placement="top">
      <span>
        <Chip
          variant="soft"
          size='sm'
          color="warning"
          startDecorator={iconUi({ id: 'league' })}
          sx={{ mx: 0.5, border: '1px solid', borderColor: 'divider' }}
        >
          <span>{leagueLab}</span>
        </Chip>
      </span>
    </Tooltip>
  )
}

function buildCoachChipItem(team) {
  const coach = getTeamCoach(team)

  const coachName = String(coach?.fullName || coach?.name || '').trim()
  const coachPhoto = String(coach?.photo || '').trim() || roleImage

  const label = coachName || 'לא עודכן מאמן'
  const tipText = coachName ? `מאמן הקבוצה: ${coachName}` : 'לא עודכן מאמן לקבוצה'
  const color = coachName ? 'success' : 'danger'

  return wrapItem(
    'coach',
    <Tooltip title={tipText} arrow placement="top">
      <span>
        <Chip
          size="sm"
          variant="soft"
          color={color}
          sx={sx.chipRole}
          startDecorator={
            <Avatar src={coachPhoto} alt={coachName || 'מאמן'} sx={sx.chipAvatar} />
          }
        >
          <span>{label}</span>
        </Chip>
      </span>
    </Tooltip>
  )
}

function buildLevelItem({ key, label, value, sx, tooltip }) {
  const starsNode = <LevelStars label={label} value={value} sx={sx} />

  if (!tooltip) {
    return wrapItem(key, starsNode)
  }

  return wrapItem(
    key,
    <Tooltip title={tooltip} placement="top">
      <Box>{starsNode}</Box>
    </Tooltip>
  )
}

function buildProjectChipItem(team) {
  const isProject = team?.project
  const iconId = isProject ? 'project' : 'isNotProject'
  const chipColor = isProject ? 'success' : 'danger'
  const chipLab = isProject ? 'פרויקט' : 'לא פרויקט'
  return wrapItem(
    'project',
    <Chip variant="solid" size='sm' color={chipColor} startDecorator={iconUi({id: iconId })} sx={{ mx: 0.5 }}>
      <span>{chipLab}</span>
    </Chip>
  )
}

function buildCityItem(city) {
  if (!city) return null

  return wrapItem(
    'city',
    <Chip size="sm" variant="soft" color="neutral">
      {city}
    </Chip>
  )
}

function buildPlayerItems({ entity, sx }) {
  const player = entity || {}
  const ui = player?.ui || {}
  const isPrivate = player?.isPrivatePlayer

  if (!isPrivate) {
    return [
      buildLevelItem({
        key: 'level',
        label: 'יכולת',
        value: player?.level,
        sx,
      }),
      buildDividerItem('divider'),
      buildLevelItem({
        key: 'potential',
        label: 'פוטנציאל',
        value: player?.levelPotential,
        sx,
      }),
      wrapItem('type', <TypeChip player={player} />),
      wrapItem('squadRole', <SquadRoleChip player={player} />),
    ].filter(Boolean)
  }
  if (isPrivate) {
    return [
      buildLevelItem({
        key: 'level',
        label: 'יכולת',
        value: player?.level,
        sx,
      }),
      buildDividerItem('divider'),
      buildLevelItem({
        key: 'potential',
        label: 'פוטנציאל',
        value: player?.levelPotential,
        sx,
      }),
      wrapItem('private', <PrivateChip />),
    ].filter(Boolean)
  }
}

function buildTeamItems({ entity, sx }) {
  const team = entity || {}

  const usedLevel = team?.squadStrength?.level?.usedCount
  const usedPotential = team?.squadStrength?.levelPotential?.usedCount

  return [
    buildLevelItem({
      key: 'level',
      label: 'יכולת',
      value: team?.level,
      sx,
      tooltip:
        team?.level && usedLevel != null
          ? `הרמה מחושבת לפי ${usedLevel} שחקנים`
          : '',
    }),
    buildDividerItem('divider'),
    buildLevelItem({
      key: 'potential',
      label: 'פוטנציאל',
      value: team?.levelPotential,
      sx,
      tooltip:
        team?.levelPotential && usedPotential != null
          ? `הפוטנציאל מחושב לפי ${usedPotential} שחקנים`
          : '',
    }),
    buildProjectChipItem(team),
    buildLeagueChipItem(team),
    buildCoachChipItem(team),
  ].filter(Boolean)
}

function buildClubItems({ entity }) {
  const club = entity || {}

  return [
    buildCityItem(club?.city),
  ].filter(Boolean)
}

const buildersByType = {
  player: buildPlayerItems,
  team: buildTeamItems,
  club: buildClubItems,
}

export function buildPreviewMetaChips({ entityType, entity, sx, context = {} }) {
  const builder = buildersByType[entityType]

  if (!builder) return []

  return builder({
    entity,
    sx,
    context,
  })
}
