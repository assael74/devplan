import { safeArr, uniqBy } from './array.utils'

export const getAllTeams = ({ teams, clubs } = {}) => {
  const t = safeArr(teams)
  if (t.length) return t

  const fromClubs = safeArr(clubs).flatMap((c) => safeArr(c?.teams))
  return uniqBy(fromClubs, (x) => x?.id)
}
