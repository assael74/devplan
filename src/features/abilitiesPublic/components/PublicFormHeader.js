// features/abilitiesPublic/components/PublicFormHeader.js

import React from 'react'
import { Avatar, Box, Chip, Sheet, Stack, Typography } from '@mui/joy'

import StarRating from '../../../ui/domains/ratings/JoyStarRating.js'
import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { domainsHeaderSx as sx } from './sx/domainsHeader.sx'

import { getFullDateIl } from '../../../shared/format/dateUtiles.js'

import playerImage from '../../../ui/core/images/playerImage.jpg'
import roleImage from '../../../ui/core/images/roleImage.png'
import { buildFallbackAvatar } from '../../../ui/core/avatars/fallbackAvatar.js'

function clean(value) {
  return String(value ?? '').trim()
}

function buildInitials(value) {
  return clean(value)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export default function PublicFormHeader({ form = {} }) {
  const {
    overallScore = null,
    overallStars = 0,
    draft = {},
    bits = {},
  } = form

  const playerName = clean(draft?.playerName || bits?.playerName)
  const playerPhoto = draft?.playerPhoto || bits?.playerPhoto || playerImage

  const evaluatorName = clean(draft?.evaluatorName)
  const evaluatorType = clean(draft?.evaluatorType)
  const evaluatorPhoto = draft?.evaluatorPhoto || roleImage

  const teamName = clean(draft?.teamName)
  const teamYear = clean(draft?.teamYear)

  const clubName = clean(draft?.clubName)
  const clubId = clean(draft?.club?.id)
  const fallbackAvatar = buildFallbackAvatar({ entityType: 'club', id: clubId, name: clubName })
  const clubPhoto = draft?.clubPhoto || fallbackAvatar

  const evalDate = clean(bits?.evalDate || draft?.evalDate)

  const playerInitials = buildInitials(playerName)
  const showTeamLabel = [teamName, teamYear].filter(Boolean).join(' · ')
  const showEvaluatorLabel = evaluatorName || evaluatorType
  const showClubLabel = clubName

  return (
    <Sheet sx={sx.root}>
      <Sheet variant="solid" color="primary" invertedColors sx={sx.card}>
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar
              size="lg"
              src={playerPhoto}
              sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700 }}
            >
              {playerInitials || iconUi({ id: 'player' })}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography level="title-lg" sx={{ color: '#fff' }}>
                {playerName || 'טופס הערכת יכולות'}
              </Typography>

              {showClubLabel ? (
                <Chip
                  size="sm"
                  variant="soft"
                  startDecorator={
                    <Avatar
                      size="sm"
                      src={clubPhoto}
                      sx={{ '--Avatar-size': '20px' }}
                    >
                      {iconUi({ id: 'club' })}
                    </Avatar>
                  }
                >
                  {showClubLabel}
                </Chip>
              ) : null}
            </Box>

            <Sheet variant="soft" sx={sx.scoreCard}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
              <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.82)', textAlign: 'center' }}>
                ציון כללי
              </Typography>

              <Typography level="title-md" sx={{ color: '#fff', textAlign: 'center' }}>
                {overallScore == null ? '-' : overallScore}
              </Typography>
            </Box>
            </Sheet>
          </Stack>

          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {showTeamLabel ? (
              <Chip
                size="sm"
                variant="soft"
                startDecorator={
                  <Avatar
                    size="sm"
                    src={clubPhoto}
                    sx={{ '--Avatar-size': '20px' }}
                  >
                    {iconUi({ id: 'team' })}
                  </Avatar>
                }
              >
                {showTeamLabel}
              </Chip>
            ) : null}

            {showEvaluatorLabel ? (
              <Chip
                size="sm"
                variant="soft"
                startDecorator={
                  <Avatar size="sm" src={evaluatorPhoto} sx={{ '--Avatar-size': '20px' }}>
                    {iconUi({ id: 'role' })}
                  </Avatar>
                }
              >
                {showEvaluatorLabel}
              </Chip>
            ) : null}

            {evalDate ? (
              <Chip size="sm" variant="soft" startDecorator={iconUi({ id: 'calendar' })}>
                {getFullDateIl(evalDate)}
              </Chip>
            ) : null}
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography level="body-xs" sx={{ color: 'rgba(255,255,255,0.92)' }}>
              הערכה כללית לפי המילוי הנוכחי
            </Typography>

            <Box sx={sx.starsWrap}>
              <StarRating value={overallStars || 0} readOnly />
            </Box>
          </Stack>
        </Stack>
      </Sheet>
    </Sheet>
  )
}
