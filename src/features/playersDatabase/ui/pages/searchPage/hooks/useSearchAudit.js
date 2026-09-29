// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchAudit.js
import * as React from 'react'

import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'
import {
  buildAuditFindingId,
  getPlayersDatabaseWriteAction,
  listRecentPlayersDatabaseWriteActions,
  runPlayerDatabaseAudit,
} from '../../../../services/audit/index.js'
import {
  getWriteActionReceiptV2,
  listWriteActionReceiptsV2,
  persistWriteActionAuditResultV2,
} from '../../../../services/writeV2/index.js'
import {
  auditClearStatsReceiptV2,
  auditLeagueV2,
  auditRosterV2,
  auditStatsV2,
} from '../../../../services/auditV2/index.js'
import { reconcileStatsAuditStageV2 } from '../../../../services/auditV2/stats/reconcileStage.js'
import { buildPartialAuditDefaults } from '../logic/searchAuditScope.logic.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export default function useSearchAudit({ rows }) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [recentWriteActions, setRecentWriteActions] = React.useState([])
  const [recentWriteActionsBusy, setRecentWriteActionsBusy] = React.useState(false)
  const [recentWriteActionReceiptsV2, setRecentWriteActionReceiptsV2] = React.useState([])
  const [recentWriteActionReceiptsV2Busy, setRecentWriteActionReceiptsV2Busy] = React.useState(false)

  const partialAuditDefaults = React.useMemo(
    () => buildPartialAuditDefaults(rows),
    [rows]
  )

  const loadRecentWriteActions = React.useCallback(async () => {
    setRecentWriteActionsBusy(true)
    try {
      setRecentWriteActions(await listRecentPlayersDatabaseWriteActions({ maxResults: 5 }))
    } catch (recentActionsError) {
      console.error('[playersDatabase] Recent write actions read failed:', recentActionsError)
      setRecentWriteActions([])
    } finally {
      setRecentWriteActionsBusy(false)
    }
  }, [])

  const loadRecentWriteActionReceiptsV2 = React.useCallback(async () => {
    setRecentWriteActionReceiptsV2Busy(true)
    try {
      setRecentWriteActionReceiptsV2(await listWriteActionReceiptsV2({ maxResults: 5 }))
    } catch (receiptError) {
      console.error('[playersDatabase] Recent V2 receipts read failed:', receiptError)
      setRecentWriteActionReceiptsV2([])
    } finally {
      setRecentWriteActionReceiptsV2Busy(false)
    }
  }, [])

  const openAudit = React.useCallback(() => {
    setOpen(true)
    setError('')
    void loadRecentWriteActions()
    void loadRecentWriteActionReceiptsV2()
  }, [loadRecentWriteActions, loadRecentWriteActionReceiptsV2])

  const closeAudit = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleScopeChange = React.useCallback(() => {
    setResult(null)
  }, [])

  const runAudit = React.useCallback(async scope => {
    if (busy) return
    setBusy(true)
    setError('')

    try {
      setResult(await runPlayerDatabaseAudit({ scope }))
    } catch (auditError) {
      console.error('[playersDatabase] Data audit failed:', auditError)
      setError(
        auditError instanceof Error
          ? auditError.message
          : 'בדיקת מצב הנתונים נכשלה'
      )
    } finally {
      setBusy(false)
    }
  }, [busy])

  const runAuditForWriteAction = React.useCallback(async writeActionId => {
    if (busy) return
    const id = clean(writeActionId)
    if (!id) {
      setError('יש להזין מזהה טעינה.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const writeAction = await getPlayersDatabaseWriteAction({ writeActionId: id })
      if (!writeAction) throw new Error('מזהה הטעינה לא נמצא.')
      if (!writeAction.auditScope) {
        throw new Error('לפעולה זו עדיין אין היקף Audit. היא טרם הגיעה לשלב הכתיבה הקנונית.')
      }
      setResult(await runPlayerDatabaseAudit({
        scope: writeAction.auditScope,
        includeWriteRecovery: false,
      }))
    } catch (auditError) {
      setError(auditError instanceof Error ? auditError.message : 'בדיקת מזהה הטעינה נכשלה')
    } finally {
      setBusy(false)
    }
  }, [busy])

  const runAuditForReceiptV2 = React.useCallback(async receiptId => {
    if (busy) return

    const id = clean(receiptId)
    if (!id) {
      setError('יש לבחור Receipt V2.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const receipt = await getWriteActionReceiptV2({ receiptId: id })
      if (!receipt) throw new Error('Receipt V2 לא נמצא.')

      const auditTarget = receipt.auditTarget || {}
      let nextResult = null

      if (receipt.flowType === 'league') {
        nextResult = await auditLeagueV2({
          leagueId: clean(auditTarget.leagueId),
          seasonKey: clean(auditTarget.seasonKey),
          ...(receipt.operationType === 'delete' && receipt.label === 'DELETE_LEAGUE_SEASON'
            ? { expectedLifecycle: 'season_absent' } : {}),
        })
      } else if (receipt.flowType === 'roster') {
        nextResult = await auditRosterV2({
          birthTeamDocumentId: clean(auditTarget.birthTeamDocumentId),
          seasonKey: clean(auditTarget.seasonKey),
        })
      } else if (receipt.flowType === 'stats') {
        const auditInput = {
          birthTeamDocumentId: clean(auditTarget.birthTeamDocumentId),
          seasonKey: clean(auditTarget.seasonKey),
        }
        nextResult = clean(receipt.operationType) === 'clear'
          ? await auditClearStatsReceiptV2(auditInput)
          : await auditStatsV2(auditInput)
      } else {
        throw new Error(`Audit V2 עבור ${receipt.flowType || 'flow לא ידוע'} עדיין לא מיושם.`)
      }
      const nextReceiptStatus = await persistWriteActionAuditResultV2({
        receiptId: id,
        audit: nextResult,
      })

      if (nextReceiptStatus !== receipt.status) {
        await loadRecentWriteActionReceiptsV2()
      }

      setResult({
        ...nextResult,
        auditVersion: 'v2',
        receiptId: id,
      })
    } catch (auditError) {
      console.error('[playersDatabase] Receipt V2 Audit failed:', auditError)
      setError(auditError instanceof Error ? auditError.message : 'בדיקת Receipt V2 נכשלה')
    } finally {
      setBusy(false)
    }
  }, [busy, loadRecentWriteActionReceiptsV2])

  const reconcileStatsAuditStage = React.useCallback(async ({ receiptId = '', stage = '' } = {}) => {
    if (busy) return

    const id = clean(receiptId)
    if (!id) {
      setError('חסר Receipt V2 לתיקון Stats.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const receipt = await getWriteActionReceiptV2({ receiptId: id })
      if (!receipt) throw new Error('Receipt V2 לא נמצא.')

      const auditTarget = receipt.auditTarget || {}
      const reconcileResult = await reconcileStatsAuditStageV2({
        birthTeamDocumentId: clean(auditTarget.birthTeamDocumentId),
        seasonKey: clean(auditTarget.seasonKey),
        stage,
        receiptId: id,
      })

      await loadRecentWriteActionReceiptsV2()
      setResult({
        ...reconcileResult.audit,
        auditVersion: 'v2',
        receiptId: id,
      })
    } catch (reconcileError) {
      console.error('[playersDatabase] Stats V2 stage repair failed:', reconcileError)
      if (reconcileError?.audit) {
        setResult({
          ...reconcileError.audit,
          auditVersion: 'v2',
          receiptId: id,
        })
      }
      setError(
        reconcileError instanceof Error
          ? reconcileError.message
          : 'סנכרון שלב Stats נכשל'
      )
    } finally {
      setBusy(false)
    }
  }, [busy, loadRecentWriteActionReceiptsV2])

  const openPlayer = React.useCallback((finding, context = {}) => {
    const playerId = clean(finding?.playerDocumentId || finding?.documentId)
    if (!playerId) return

    const target = PLAYERS_DATABASE_UI_ROUTES.player({
      playerId,
      seasonKey: clean(context?.seasonKey),
      teamId: clean(context?.teamDocumentId),
      leagueId: clean(context?.leagueId),
      auditFindingId:
        clean(finding?.auditFindingId) || buildAuditFindingId(finding),
    })
    window.open(target, '_blank', 'popup=yes,width=1280,height=900,noopener,noreferrer')
  }, [])

  const openTeam = React.useCallback((finding, context = {}) => {
    const teamId = clean(context?.teamDocumentId || finding?.teamDocumentId)
    const seasonKey = clean(context?.seasonKey || finding?.seasonKey)
    const leagueId = clean(context?.leagueId || finding?.actual?.leagueId)

    if (!teamId || !seasonKey || !leagueId) {
      setError('חסרים פרטי קבוצה, עונה או ליגה למעבר לתיקון.')
      return
    }

    const target = PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId,
      teamId,
      seasonKey,
      auditSeasonKey: seasonKey,
      auditFindingId:
        clean(finding?.auditFindingId) || buildAuditFindingId(finding),
      openStatsImport: context?.openStatsImport === true,
    })
    window.open(target, '_blank', 'popup=yes,width=1280,height=900,noopener,noreferrer')
  }, [])

  const openLeague = React.useCallback(finding => {
    const leagueId = clean(finding?.actual?.leagueId || finding?.relatedDocumentId)
    const seasonKey = clean(finding?.seasonKey)

    if (!leagueId) {
      setError('חסר מזהה ליגה למעבר לתיקון.')
      return
    }

    const target = PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
      ...(seasonKey ? { seasonKey } : {}),
      auditFindingId:
        clean(finding?.auditFindingId) || buildAuditFindingId(finding),
    })
    window.open(target, '_blank', 'popup=yes,width=1280,height=900,noopener,noreferrer')
  }, [])

  const openLeaguesCenter = React.useCallback(() => {
    window.open(
      PLAYERS_DATABASE_UI_ROUTES.leagues(),
      '_blank',
      'popup=yes,width=1280,height=900,noopener,noreferrer'
    )
  }, [])

  return {
    open,
    busy,
    error,
    result,
    recentWriteActions,
    recentWriteActionsBusy,
    recentWriteActionReceiptsV2,
    recentWriteActionReceiptsV2Busy,
    partialAuditDefaults,
    openAudit,
    closeAudit,
    handleScopeChange,
    runAudit,
    runAuditForWriteAction,
    runAuditForReceiptV2,
    openPlayer,
    openTeam,
    openLeague,
    openLeaguesCenter,
    reconcileStatsAuditStage,
  }
}
