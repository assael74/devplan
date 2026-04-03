export function buildPlayerFullName(player) {
  const first = player?.playerFirstName || ''
  const last = player?.playerLastName || ''
  return `${first} ${last}`.trim() || 'שחקן'
}

export function buildPlayerSubLine(player) {
  const clubName = player?.club?.clubName || player?.clubName || ''
  const teamName = player?.team?.teamName || player?.teamName || ''
  const birth = player?.birth
  return [clubName, teamName, birth].filter(Boolean).join(' • ')
}
