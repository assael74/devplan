export function buildPlayerFullName(player) {
  const first = player?.playerFirstName || ''
  const last = player?.playerLastName || ''

  return `${first} ${last}`.trim() || player?.playerFullName || player?.name || 'שחקן'
}

export function buildPlayerSubLine(player) {
  const clubName = player?.club?.clubName || player?.clubName || ''
  const teamName = player?.team?.teamName || player?.teamName || ''
  const year = player?.team?.teamYear || player?.teamYear || player?.birthYear || player?.birth || ''

  return [clubName || teamName, clubName && teamName ? teamName : '', year].filter(Boolean).join(' · ')
}

export function isProjectPlayer(player) {
  return player?.type === 'project'
}

export function isKeyPlayer(player) {
  return player?.squadRole === 'key'
}
