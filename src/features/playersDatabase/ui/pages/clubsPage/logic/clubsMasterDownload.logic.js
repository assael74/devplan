export const downloadJson = (data = {}, fileName = 'data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const downloadClubsMasterJson = (clubsMasterDoc = {}) => {
  downloadJson(clubsMasterDoc, 'clubs-master.json')
}

export const downloadClubMasterEntryJson = (club = {}) => {
  const clubId = String(club?.clubId || 'club').trim() || 'club'
  downloadJson(club, `clubs-master-${clubId}.json`)
}
