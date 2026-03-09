// shared/entityLifecycle/resolveDeletePolicy.js
export function resolveDeletePolicy(entityType, meta = {}) {
  switch (entityType) {
    case 'player': {
      const { games = 0, meetings = 0, payments = 0 } = meta
      const canDelete = games === 0 && meetings === 0 && payments === 0
      return {
        canDelete,
        canArchive: true,
        reason: canDelete ? null : 'לא ניתן למחוק שחקן עם משחקים / פגישות / תשלומים',
      }
    }

    case 'team': {
      const isDeletable = meta?.isDeletable
      if (typeof isDeletable === 'boolean') {
        return {
          canDelete: isDeletable,
          canArchive: true,
          reason: isDeletable ? null : 'לא ניתן למחוק קבוצה עם שחקנים / משחקים / פגישות',
        }
      }

      const { players = 0, games = 0, meetings = 0 } = meta
      const canDelete = players === 0 && games === 0 && meetings === 0
      return {
        canDelete,
        canArchive: true,
        reason: canDelete ? null : 'לא ניתן למחוק קבוצה עם שחקנים / משחקים / פגישות',
      }
    }

    case 'club': {
      const isDeletable = meta?.isDeletable
      if (typeof isDeletable === 'boolean') {
        return {
          canDelete: isDeletable,
          canArchive: true,
          reason: isDeletable ? null : 'לא ניתן למחוק מועדון עם קבוצות משויכות',
        }
      }

      const { teams = 0 } = meta
      const canDelete = teams === 0
      return {
        canDelete,
        canArchive: true,
        reason: canDelete ? null : 'לא ניתן למחוק מועדון עם קבוצות משויכות',
      }
    }

    case 'tag': {
      const { children = 0, usage = 0 } = meta

      const canDelete = children === 0 && usage === 0

      return {
        canDelete,
        canArchive: true,
        reason: canDelete
          ? null
          : children > 0
          ? 'לא ניתן למחוק תג עם תתי־תגים'
          : 'לא ניתן למחוק תג שנמצא בשימוש',
      }
    }

    case 'videoAnalysis': {
      const canDelete = true

      return {
        canDelete,
        canArchive: true,
        reason: null
      }
    }

    case 'videos': {
      const canDelete = false

      return {
        canDelete,
        canArchive: true,
        reason: null
      }
    }

    case 'role':
      return {
        canDelete: true,
        canArchive: true,
        reason: null,
      }

    case 'scouting':
      return {
        canDelete: true,
        canArchive: true,
        reason: null,
      }

    default:
      return {
        canDelete: false,
        canArchive: false,
        reason: 'ישות לא נתמכת',
      }
  }
}
