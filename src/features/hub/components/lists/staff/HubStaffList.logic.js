// src/features/hub/components/lists/staff/HubStaffList.logic.js

import { STAFF_ROLE_OPTIONS } from '../../../../../shared/roles/roles.constants.js'
import roleImage from '../../../../../ui/core/images/roleImage.png'

export function buildStaffMetaMap() {
  const map = new Map()

  for (const option of STAFF_ROLE_OPTIONS) {
    map.set(option.id, option)
  }

  return map
}

export function buildStaffOrgText(row) {
  const clubsArr = Array.isArray(row?.clubs) ? row.clubs.filter(Boolean) : []
  const teamsArr = Array.isArray(row?.teams) ? row.teams.filter(Boolean) : []

  const clubText =
    clubsArr.length === 1
      ? clubsArr[0]?.clubName || clubsArr[0]?.name || 'מועדון'
      : clubsArr.length > 1
      ? `${clubsArr.length} מועדונים`
      : ''

  const teamText =
    teamsArr.length === 1
      ? teamsArr[0]?.teamName || teamsArr[0]?.name || 'קבוצה'
      : teamsArr.length > 1
      ? `${teamsArr.length} קבוצות`
      : ''

  return [clubText, teamText].filter(Boolean).join(' • ')
}

export function buildStaffRowVm(row, metaById) {
  const meta = row?.type ? metaById.get(row.type) : null

  return {
    ...row,
    photo: row?.photo || roleImage,
    roleLabel: meta?.labelH || '',
    idIcon: meta?.idIcon || '',
    subline: buildStaffOrgText(row),
  }
}
