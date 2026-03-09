// ui/fields/selectUi/teams/TeamMultiSelectField.js
import * as React from 'react'
import { FormControl, FormLabel, Select, Option, Stack, Chip, Box, Avatar, Typography } from '@mui/joy'
import { buildFallbackAvatar } from '../../../core/avatars/fallbackAvatar.js'

const asArray = (x) => (Array.isArray(x) ? x : [])
const normId = (v) => String(v ?? '').trim()
const uniqIds = (arr) => Array.from(new Set(asArray(arr).map(normId).filter(Boolean)))

const pickTeamName = (t) => t?.teamName || t?.name || 'קבוצה'
const pickTeamPhoto = (t) => t?.photo || ''
const pickClubPhoto = (c) => c?.photo || ''

const pickClubId = (c) => normId(c?.id || c?.clubId)
const pickClubName = (c) => c?.clubName || c?.name || 'מועדון'

export default function TeamMultiSelectField({
  value = [],
  onChange,
  teams = [],
  clubs = [],
  clubIds = [],
  error = false,
  disabled = false,
  required,
  label = 'קבוצות',
  size = 'sm',
  placeholder = 'בחר קבוצות',
}) {
  const selected = uniqIds(value)

  const clubMap = React.useMemo(() => {
    const m = new Map()
    asArray(clubs).forEach((c) => {
      const id = pickClubId(c)
      if (id) m.set(id, c)
    })
    return m
  }, [clubs])

  const clubByTeam = (team) => {
    const cId = normId(team?.clubId)
    return cId ? clubMap.get(cId) : null
  }

  const resolveTeamAvatarSrc = (team) => {
    const teamPhoto = pickTeamPhoto(team)
    if (teamPhoto) return teamPhoto

    const club = clubByTeam(team)
    const clubPhoto = pickClubPhoto(club)
    if (clubPhoto) return clubPhoto

    return buildFallbackAvatar({
      entityType: 'team',
      id: team?.id,
      name: pickTeamName(team),
      subline: team?.teamYear ? String(team.teamYear) : '',
    })
  }

  const allowedClubSet = React.useMemo(() => {
    const idsFromClubs = uniqIds(asArray(clubs).map(pickClubId))
    const base = idsFromClubs.length ? idsFromClubs : uniqIds(clubIds)
    return new Set(base)
  }, [clubs, clubIds])

  const filteredTeams = React.useMemo(() => {
    const all = asArray(teams)
    if (!allowedClubSet.size) return all
    return all.filter((t) => allowedClubSet.has(normId(t?.clubId)))
  }, [teams, allowedClubSet])

  const teamMap = React.useMemo(() => {
    const m = new Map()
    filteredTeams.forEach((t) => m.set(normId(t?.id), t))
    return m
  }, [filteredTeams])

  const clubNameByTeam = React.useCallback(
    (team) => {
      const cId = normId(team?.clubId)
      const club = clubMap.get(cId)
      return club ? pickClubName(club) : ''
    },
    [clubMap]
  )

  const buildOptionLabel = React.useCallback(
    (team) => {
      const teamName = pickTeamName(team)
      const clubName = clubNameByTeam(team)
      const yearTxt = team?.teamYear ? ` • ${team.teamYear}` : ''
      // תצוגה קצרה לצ'יפ: "קבוצה • 2012 (מועדון)"
      return clubName ? `${teamName}${yearTxt} (${clubName})` : `${teamName}${yearTxt}`
    },
    [clubNameByTeam]
  )

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        multiple
        value={selected}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(uniqIds(val))}
        placeholder={placeholder}
        renderValue={(selectedOptions) => (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {selectedOptions.map((opt) => {
              const team = teamMap.get(normId(opt.value))
              const photo = pickTeamPhoto(team)
              const src = team ? resolveTeamAvatarSrc(team) : ''
              const labelTxt = team ? buildOptionLabel(team) : opt?.label

              return (
                <Chip
                  key={opt.value}
                  size="sm"
                  variant="outlined"
                  startDecorator={
                    <Avatar size="sm" src={src} alt={labelTxt || ''}>
                      {!src ? String(labelTxt || '').trim().slice(0, 1) : null}
                    </Avatar>
                  }
                >
                  {labelTxt}
                </Chip>
              )
            })}
          </Box>
        )}
        slotProps={{
          listbox: { sx: { maxHeight: 260, width: '100%' } },
        }}
      >
        {filteredTeams.map((t) => {
          const id = normId(t?.id)
          const teamName = pickTeamName(t)
          const clubName = clubNameByTeam(t)

          const photo = pickTeamPhoto(t)
          const src = resolveTeamAvatarSrc(t)

          const labelTxt = buildOptionLabel(t)

          return (
            <Option key={id} value={id} label={labelTxt}>
              <Stack direction="row" gap={1} alignItems="center" sx={{ width: '100%' }}>
                <Avatar src={src} alt={teamName} size="sm">
                  {!src ? String(teamName).trim().slice(0, 1) : null}
                </Avatar>

                <Stack sx={{ minWidth: 0 }} spacing={0.25}>
                  <Typography level="body-sm" noWrap>
                    {teamName}
                    {t?.teamYear ? (
                      <Typography component="span" level="body-xs" sx={{ opacity: 0.7 }}>
                        {` • ${t.teamYear}`}
                      </Typography>
                    ) : null}
                  </Typography>

                  {clubName ? (
                    <Typography level="body-xs" sx={{ opacity: 0.7 }} noWrap>
                      {clubName}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </Option>
          )
        })}
      </Select>
    </FormControl>
  )
}
