// src/ui/entityLifecycle/LifecycleProvider.js
import React, { createContext, useContext, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useEntityLifecycle } from '../../../shared/entityLifecycle/useEntityLifecycle.js'
import ArchiveEntityDialog from './ArchiveEntityDialog.js'
import EntityLifecycleDialog from './EntityLifecycleDialog.js'
import ArchiveRestoreEntityDialog from './ArchiveRestoreEntityDialog.js'

import { useSnackbar } from '../../core/feedback/snackbar/SnackbarProvider.js'
import { deleteActions } from './delete/deleteActions.js'
import { useCoreData } from '../../../features/coreData/CoreDataProvider.js'

import { debugLog } from '../../../services/firestore/shorts/shortsDebug.utils.js'
import { SHORTS_DEBUG } from '../../../services/firestore/shorts/shortsDebug.config.js'
import { updateByRouterFields } from '../../../services/firestore/shorts/shortsUpdateByRouter.js'

const Ctx = createContext(null)
export const useLifecycle = () => useContext(Ctx)

const mapToneToStatus = (tone) => (tone === 'danger' ? 'error' : 'success')

const pickShortDoc = (bucket, shortKey) => {
  if (!bucket) return null
  if (bucket[shortKey]) return bucket[shortKey]
  if (Array.isArray(bucket)) return bucket.find((d) => d?.shortKey === shortKey || d?.key === shortKey) || null
  return null
}

const isEntityProfilePath = (pathname, base, id) => {
  if (!pathname || !base || !id) return false
  const p = `/${base}/${id}`
  return pathname === p || pathname.startsWith(`${p}/`)
}

const resolveRouterEntityType = (entityType) => {
  if (entityType === 'player') return 'players'
  if (entityType === 'team') return 'teams'
  if (entityType === 'club') return 'clubs'
  if (entityType === 'role') return 'roles'
  if (entityType === 'tag') return 'tags'
  if (entityType === 'videoAnalysis') return 'videoAnalysis'
  if (entityType === 'videoAGeneral') return 'videoGeneral'
  return null
}

export default function LifecycleProvider({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useSnackbar()
  const { playersShorts, teamsShorts, clubsShorts, rolesShorts } = useCoreData()

  const shortsBundle = useMemo(
    () => ({ playersShorts, teamsShorts, clubsShorts, rolesShorts }),
    [playersShorts, teamsShorts, clubsShorts, rolesShorts]
  )

  const lifecycle = useEntityLifecycle({
    deps: {
      getMeta: async (entity, metaIn) => {
        const e = entity || {}
        const { entityType, id } = e
        const base = metaIn && typeof metaIn === 'object' ? metaIn : {}

        if (entityType === 'team') {
          const doc = pickShortDoc(shortsBundle.playersShorts, 'players.playersTeam')
          const list = Array.isArray(doc?.list) ? doc.list : []
          const players = list.filter((x) => x?.teamId === id).length
          if (SHORTS_DEBUG.enabled) debugLog('GET_META:team', { teamId: id, players })
          return { ...base, players }
        }

        if (entityType === 'club') {
          const doc = pickShortDoc(shortsBundle.teamsShorts, 'teams.teamsInfo')
          const list = Array.isArray(doc?.list) ? doc.list : []
          const teams = list.filter((x) => x?.clubId === id).length
          if (SHORTS_DEBUG.enabled) debugLog('GET_META:club', { clubId: id, teams })
          return { ...base, teams }
        }

        if (entityType === 'player') {
          if (SHORTS_DEBUG.enabled) debugLog('GET_META:player', { playerId: id, base })
          return { ...base }
        }

        // staff/roles כרגע בלי meta מיוחד
        return { ...base }
      },

      archive: async ({ entityType, id }) => {
        const routerEntityType = resolveRouterEntityType(entityType)
        if (!routerEntityType) throw new Error(`No router entityType for "${entityType}"`)

        const fieldsPatch = { active: false }

        debugLog('UI_ARCHIVE:update:start', {
          entityType,
          routerEntityType,
          id,
          fieldsKeys: Object.keys(fieldsPatch),
          mode: SHORTS_DEBUG?.dryRun ? 'DRY_RUN' : 'WRITE',
        })

        const res = await updateByRouterFields({
          entityType: routerEntityType,
          id,
          fieldsPatch,
          createIfMissing: false,
          requireAnyUpdated: true,
        })

        debugLog('UI_ARCHIVE:update:success', { entityType, routerEntityType, id, res })
        return res
      },

      restore: async ({ entityType, id }) => {
        const routerEntityType = resolveRouterEntityType(entityType)
        if (!routerEntityType) throw new Error(`No router entityType for "${entityType}"`)

        const fieldsPatch = { active: true }

        debugLog('UI_RESTORE:update:start', {
          entityType,
          routerEntityType,
          id,
          fieldsKeys: Object.keys(fieldsPatch),
          mode: SHORTS_DEBUG?.dryRun ? 'DRY_RUN' : 'WRITE',
        })

        const res = await updateByRouterFields({
          entityType: routerEntityType,
          id,
          fieldsPatch,
          createIfMissing: false,
          requireAnyUpdated: true,
        })

        debugLog('UI_RESTORE:update:success', { entityType, routerEntityType, id, res })
        return res
      },

      remove: async ({ entityType, id }) => {
        console.log('[LIFECYCLE remove] enter', { entityType, id })
        const fn = deleteActions[entityType]
        console.log(deleteActions)
        if (!fn) throw new Error(`No delete action for entityType "${entityType}"`)
        return fn({ id })
      },
    },

    notify: (payload) => {
      const isArchive = payload?.action === 'archive' || payload?.action === 'restore'

      notify({
        status: mapToneToStatus(payload?.tone),
        action: isArchive ? 'update' : payload?.action,
        entityType: payload?.entityType || null,
        entityName: payload?.entityName || null,
        message: payload?.message || null,
        details: payload?.details || null,
      })
    },

    onAfterSuccess: ({ action, entityType, id }) => {
      if (action !== 'delete') return
      if (!id) return

      const pathname = location?.pathname || ''

      if (entityType === 'team') {
        if (isEntityProfilePath(pathname, 'teams', id)) navigate('/hub', { replace: true })
        return
      }

      if (entityType === 'player') {
        if (isEntityProfilePath(pathname, 'players', id)) navigate('/hub', { replace: true })
      }
    },
  })

  return (
    <Ctx.Provider value={lifecycle}>
      {children}
      <ArchiveEntityDialog {...lifecycle.archiveDialogProps} />
      <EntityLifecycleDialog {...lifecycle.lifecycleDialogProps} />
      <ArchiveRestoreEntityDialog {...lifecycle.restoreDialogProps} />
    </Ctx.Provider>
  )
}
