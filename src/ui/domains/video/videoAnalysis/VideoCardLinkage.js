// C:\projects\devplan\src\ui\domains\video\videoAnalysis\VideoCardLinkage.js
import React from 'react'
import { Stack, Typography } from '@mui/joy'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { getFullDateIl } from '../../../../shared/format/dateUtiles.js'
import { buildFallbackAvatar } from '../../../../ui/core/avatars/fallbackAvatar.js'
import { AvatarWithClubBadge } from '../../../../ui/core/avatars/AvatarWithClubBadge'

function Unlinked() {
  return (
    <Typography level="body-xs" color="danger" sx={{ opacity: 0.6 }} startDecorator={iconUi({ id: 'noLink' })}>
      וידאו לא משויך
    </Typography>
  )
}

function PlayerLinkage({ player }) {
  return (
    <Stack direction="row" spacing={0.6} alignItems="center">
      <AvatarWithClubBadge src={player?.photo} clubColor={player?.club?.color} sx={{ width: 25, height: 25 }} />
      <Typography level="body-xs" noWrap>
        {player?.playerFirstName} {player?.playerLastName}
      </Typography>
      {player?.team?.teamName && (
        <Typography level="body-xs" sx={{ opacity: 0.6 }}>
          · {player.team.teamName}
        </Typography>
      )}
    </Stack>
  )
}

function TeamLinkage({ team }) {
  const club = team?.club || null
  const clubAvatar =
    club?.photo || buildFallbackAvatar({ entityType: 'club', id: club?.id, name: club?.clubName })

  return (
    <Stack direction="row" spacing={0.6} alignItems="center">
      <AvatarWithClubBadge src={clubAvatar} clubColor={club?.color} sx={{ width: 25, height: 25 }} />
      <Typography level="body-xs" noWrap>
        {team?.teamName}
      </Typography>
    </Stack>
  )
}

function MeetingLinkage({ meeting, player }) {
  return (
    <Stack direction="row" spacing={0.6} alignItems="center">
      <AvatarWithClubBadge src={player?.photo} clubColor={player?.club?.color} sx={{ width: 25, height: 25 }} />
      <Typography level="body-xs" noWrap>
        {player?.playerFirstName} {player?.playerLastName} · {getFullDateIl(meeting?.meetingDate) || 'פגישה'}
      </Typography>
    </Stack>
  )
}

export function VideoCardLinkage({ video }) {
  const objectType = video?.objectType
  const player = video?.player
  const team = video?.team
  const meeting = video?.meeting

  if (!objectType) return <Unlinked />

  switch (objectType) {
    case 'player':
      return player ? <PlayerLinkage player={player} /> : <Unlinked />

    case 'team':
      return team ? <TeamLinkage team={team} /> : <Unlinked />

    case 'meeting':
      return meeting && player ? <MeetingLinkage meeting={meeting} player={player} /> : <Unlinked />

    default:
      return <Unlinked />
  }
}
