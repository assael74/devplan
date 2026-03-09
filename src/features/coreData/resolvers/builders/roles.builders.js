import { safeArr, safeId } from '../../utils/data.utils.js'
import { uniqById } from '../../utils/map.utils.js'

const resolveEntities = (ids, entityById) =>
  safeArr(ids).map((id) => entityById.get(safeId(id)) || null).filter(Boolean)

export const buildRolesWithEntities = (rolesBase = [], clubById, teamById) =>
  safeArr(rolesBase).map((role) => ({
    ...role,
    clubs: resolveEntities(role?.clubsId, clubById),
    teams: resolveEntities(role?.teamsId, teamById),
  }))

const buildRolesIndex = (rolesArr, fieldName) => {
  const out = {}

  for (const role of safeArr(rolesArr)) {
    for (const id of safeArr(role?.[fieldName])) {
      const key = safeId(id)
      if (!key) continue
      ;(out[key] ||= []).push(role)
    }
  }

  Object.keys(out).forEach((key) => {
    out[key] = uniqById(out[key])
  })

  return out
}

export const buildRolesByClubId = (rolesArr) => buildRolesIndex(rolesArr, 'clubsId')
export const buildRolesByTeamId = (rolesArr) => buildRolesIndex(rolesArr, 'teamsId')
