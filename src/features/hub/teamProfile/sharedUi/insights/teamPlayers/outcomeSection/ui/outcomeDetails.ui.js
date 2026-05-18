// TEAMPROFILE/sharedUi/insights/teamPlayers/outcomeSection/ui/outcomeDetails.ui.js

const emptyArray = []

export const getOkPlayers = group => {
  const players = Array.isArray(group?.players) ? group.players : emptyArray

  return players.filter(player => !player.isWeak)
}

export const getProblemPlayers = group => {
  return Array.isArray(group?.weakPlayers) ? group.weakPlayers : emptyArray
}

export const getDetailsSummary = group => {
  const weak = group?.health?.weakCount || 0
  const checked = group?.sample?.checked || 0
  const damage = group?.health?.damageScore || 0
  const tva = group?.health?.weakWeightedTvaLabel ||
    group?.health?.weakWeightedTva ||
    0

  if (!checked) {
    return 'אין מספיק מדגם כדי לקבוע תקינות שחקנים במקבץ.'
  }

  if (!weak) {
    return `${checked} מתוך ${checked} שחקנים בטווח תקין · ללא נזק משמעותי`
  }

  return `${weak} מתוך ${checked} שחקנים לא תקינים · נזק ${damage} · מדד השפעה שלילי ${tva}`
}

export const isVisibleDetail = row => {
  return row?.id !== 'basis'
}

export const getVisibleDetails = rows => {
  const safeRows = Array.isArray(rows) ? rows : emptyArray

  return safeRows.filter(isVisibleDetail)
}
