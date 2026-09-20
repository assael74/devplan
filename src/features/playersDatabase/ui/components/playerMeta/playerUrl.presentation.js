// src/features/playersDatabase/ui/components/playerMeta/playerUrl.presentation.js

export const resolvePlayerUrl = value => {
  const playerUrl = String(value || '').trim()

  if (!playerUrl) return ''
  if (/^https?:\/\//i.test(playerUrl)) return playerUrl

  const path = playerUrl.startsWith('/')
    ? playerUrl
    : `/${playerUrl}`

  return `https://www.football.org.il${path}`
}
