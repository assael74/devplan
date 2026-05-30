// playerProfile/sharedModules/payments/playerPaymentsModule.helpers.js

export const buildPlayerName = player => {
  const first = String(player?.playerFirstName || '').trim()
  const last = String(player?.playerLastName || '').trim()
  const full = `${first} ${last}`.trim()

  return full || String(player?.playerShortName || '').trim() || 'שחקן'
}
