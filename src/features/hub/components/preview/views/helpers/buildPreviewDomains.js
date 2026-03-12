// features/hub/components/preview/helpers/buildPreviewDomains.js
import { getDomainState } from '../../preview.state'

const safeNum = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : null)
const lenOrNull = (arr) => (Array.isArray(arr) ? arr.length : null)

function stateFrom({ count, locked, stale }) {
  return getDomainState({
    count: typeof count === 'number' ? count : 0,
    isLocked: !!locked,
    isStale: !!stale,
  })
}

function pickCount({ key, entity, counts }) {
  const c = counts || {}

  if (key === 'roles') {
    const fromEntity = lenOrNull(entity?.roles)
    if (typeof fromEntity === 'number') return fromEntity
    return safeNum(c.roles)
  }

  return safeNum(c[key])
}

function buildDomain({ key, label, route, entity, counts, lockedMap, staleMap }) {
  const count = pickCount({ key, entity, counts })
  const locked = lockedMap ? lockedMap[key] : false
  const stale = staleMap ? staleMap[key] : false

  return {
    key,
    label,
    count,
    state: stateFrom({ count, locked, stale }),
    route,
  }
}

function playerDomains({ entity, routes, counts, locked, stale, isProject }) {
  const base = [
    buildDomain({ key: 'info', label: 'מידע', route: routes?.info, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'performance', label: 'ביצועי שחקן', route: routes?.performance, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'games', label: 'משחקי שחקן', route: routes?.performance, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'abilities', label: 'יכולות שחקן', route: routes?.abilities, entity, counts, lockedMap: locked, staleMap: stale }),
  ]

  if (isProject) {
    base.push(
      buildDomain({ key: 'meetings', label: 'מפגשים', route: routes?.meetings, entity, counts, lockedMap: locked, staleMap: stale }),
      buildDomain({ key: 'payments', label: 'תשלומים', route: routes?.payments, entity, counts, lockedMap: locked, staleMap: stale }),
      buildDomain({ key: 'video', label: 'וידאו', route: routes?.video, entity, counts, lockedMap: locked, staleMap: stale }),
    )
  }

  return base
}

function teamDomains({ entity, routes, counts, locked, stale }) {
  return [
    buildDomain({ key: 'players', label: 'סגל שחקנים', route: routes?.players, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'roles', label: 'צוות ואימונים', route: routes?.roles, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'games', label: 'משחקי קבוצה', route: routes?.games, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'performance', label: 'ביצועי קבוצה', route: routes?.performance, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'video', label: 'וידאו קבוצתי', route: routes?.video, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'abilities', label: 'יכולות', route: routes?.abilities, entity, counts, lockedMap: locked, staleMap: stale }),
  ]
}

function clubDomains({ entity, routes, counts, locked, stale }) {
  return [
    buildDomain({ key: 'roles', label: 'צוות', route: routes?.roles, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'teams', label: 'קבוצות', route: routes?.teams, entity, counts, lockedMap: locked, staleMap: stale }),
    buildDomain({ key: 'players', label: 'שחקנים', route: routes?.players, entity, counts, lockedMap: locked, staleMap: stale }),
  ]
}

export function buildPreviewDomains({
  entityType, // 'player' | 'team' | 'club'
  entity,
  routes,
  counts,
  locked,
  stale,
  isProject, // optional for player; fallback to entity.type === 'project'
}) {
  if (!entityType) return []

  if (entityType === 'player') {
    const proj =
      typeof isProject === 'boolean'
        ? isProject
        : String(entity?.type || '') === 'project'
    return playerDomains({ entity, routes, counts, locked, stale, isProject: proj })
  }

  if (entityType === 'team') {
    return teamDomains({ entity, routes, counts, locked, stale })
  }

  if (entityType === 'club') {
    return clubDomains({ entity, routes, counts, locked, stale })
  }

  return []
}

export default buildPreviewDomains
