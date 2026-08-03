// src/features/hub/scopes/scope.js

export const HUB_SCOPE = {
  INTERNAL: 'internal',
  PRIVATE: 'private',
  SCOUT: 'scout',
}

const SCOPE_META = {
  [HUB_SCOPE.INTERNAL]: {
    title: 'מרכז שליטה',
    subtitle: 'מועדונים, קבוצות ושחקנים',
  },
  [HUB_SCOPE.PRIVATE]: {
    title: 'שחקנים פרטיים',
    subtitle: 'ניהול שחקנים פרטיים',
  },
  [HUB_SCOPE.SCOUT]: {
    title: 'שחקנים במעקב',
    subtitle: 'ניהול תהליך הסקאוטינג',
  },
}

export function getScopeModes(scope, MODE) {
  if (scope === HUB_SCOPE.PRIVATE) return [MODE.PRIVATES]
  if (scope === HUB_SCOPE.SCOUT) return [MODE.SCOUTING]

  return [MODE.CLUBS, MODE.TEAMS, MODE.PLAYERS]
}

export function getScopeMode(scope, MODE) {
  return getScopeModes(scope, MODE)[0]
}

export function getScopeMeta(scope) {
  return SCOPE_META[scope] || SCOPE_META[HUB_SCOPE.INTERNAL]
}
