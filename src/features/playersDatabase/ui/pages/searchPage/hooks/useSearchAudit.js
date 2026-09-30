// src/features/playersDatabase/ui/pages/searchPage/hooks/useSearchAudit.js
import * as React from 'react'

import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'
import {
  getWriteActionReceiptV2,
  listWriteActionReceiptsV2,
  persistWriteActionAuditResultV2,
} from '../../../../services/writeV2/index.js'
import {
  auditClearStatsReceiptV2,
  auditLeagueV2,
  auditOrphanDataV2,
  auditRosterV2,
  auditScoutingIntegrityV2,
  auditStatsV2,
  auditStructuralIntegrityV2,
} from '../../../../services/auditV2/index.js'
import { reconcileStatsAuditStageV2 } from '../../../../services/writeV2/stats/sync/reconcileStatsAuditStageV2.js'
import { buildPartialAuditDefaults } from '../logic/searchAuditScope.logic.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const withV2Meta = (result, extra = {}) => ({
  ...result,
  auditVersion: 'v2',
  ...extra,
})

export default function useSearchAudit({ rows }) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [recentWriteActionReceiptsV2, setRecentWriteActionReceiptsV2] = React.useState([])
  const [recentWriteActionReceiptsV2Busy, setRecentWriteActionReceiptsV2Busy] = React.useState(false)

  const partialAuditDefaults = React.useMemo(
    () => buildPartialAuditDefaults(rows),
    [rows]
  )

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
    void loadRecentWriteActionReceiptsV2()
  }, [loadRecentWriteActionReceiptsV2])

  const closeAudit = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleScopeChange = React.useCallback(() => {
    setResult(null)
    setError('')
  }, [])

  const runSystemAudit = React.useCallback(async ({ type = '', birthTeamDocumentId = '', seasonKey = '' } = {}) => {
    if (busy) return

    setBusy(true)
    setError('')
    try {
      let nextResult
      if (type === 'structural') {
        nextResult = await auditStructuralIntegrityV2()
      } else if (type === 'orphans') {
        nextResult = await auditOrphanDataV2()
      } else if (type === 'scouting') {
        const teamId = clean(birthTeamDocumentId)
        const key = clean(seasonKey)
        if (!teamId || !key) throw new Error('לבדיקת מודל הסקאוט נדרשים מסמך קבוצה ועונה.')
        nextResult = await auditScoutingIntegrityV2({
          birthTeamDocumentId: teamId,
          seasonKey: key,
        })
      } else {
        throw new Error('סוג בדיקת המערכת אינו נתמך.')
      }

      setResult(withV2Meta(nextResult))
    } catch (auditError) {
      console.error('[playersDatabase] System Audit V2 failed:', auditError)
      setError(auditError instanceof Error ? auditError.message : 'בדיקת המערכת נכשלה')
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

      setResult(withV2Meta(nextResult, { receiptId: id }))
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
      setResult(withV2Meta(reconcileResult.audit, { receiptId: id }))
    } catch (reconcileError) {
      console.error('[playersDatabase] Stats V2 stage sync failed:', reconcileError)
      if (reconcileError?.audit) {
        setResult(withV2Meta(reconcileError.audit, { receiptId: id }))
      }
      setError(reconcileError instanceof Error ? reconcileError.message : 'סנכרון שלב Stats נכשל')
    } finally {
      setBusy(false)
    }
  }, [busy, loadRecentWriteActionReceiptsV2])

  const openPlayer = React.useCallback((finding, context = {}) => {
    const playerId = clean(
      finding?.playerDocumentId || finding?.documentId || finding?.target?.playerDocumentId
    )
    if (!playerId) return

    const target = PLAYERS_DATABASE_UI_ROUTES.player({
      playerId,
      seasonKey: clean(context?.seasonKey || finding?.seasonKey || finding?.target?.seasonKey),
      teamId: clean(context?.teamDocumentId || finding?.teamId || finding?.target?.birthTeamDocumentId),
      leagueId: clean(context?.leagueId || finding?.leagueId),
    })
    window.open(target, '_blank', 'popup=yes,width=1280,height=900,noopener,noreferrer')
  }, [])

  const openTeam = React.useCallback((finding, context = {}) => {
    const teamId = clean(
      context?.teamDocumentId || finding?.teamDocumentId || finding?.teamId || finding?.target?.birthTeamDocumentId
    )
    const seasonKey = clean(context?.seasonKey || finding?.seasonKey || finding?.target?.seasonKey)
    const leagueId = clean(context?.leagueId || finding?.leagueId || finding?.actual?.leagueId)

    if (!teamId || !seasonKey || !leagueId) {
      setError('חסרים פרטי קבוצה, עונה או ליגה למעבר.')
      return
    }

    const target = PLAYERS_DATABASE_UI_ROUTES.team({
      leagueId,
      teamId,
      auditSeasonKey: seasonKey,
      openStatsImport: context?.openStatsImport === true,
    })
    window.open(target, '_blank', 'popup=yes,width=1280,height=900,noopener,noreferrer')
  }, [])

  const openLeague = React.useCallback(finding => {
    const leagueId = clean(
      finding?.leagueId || finding?.actual?.leagueId || finding?.relatedDocumentId
    )
    const seasonKey = clean(finding?.seasonKey)

    if (!leagueId) {
      setError('חסר מזהה ליגה למעבר.')
      return
    }

    const target = PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
      ...(seasonKey ? { seasonKey } : {}),
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
    recentWriteActionReceiptsV2,
    recentWriteActionReceiptsV2Busy,
    partialAuditDefaults,
    openAudit,
    closeAudit,
    handleScopeChange,
    runSystemAudit,
    runAuditForReceiptV2,
    openPlayer,
    openTeam,
    openLeague,
    openLeaguesCenter,
    reconcileStatsAuditStage,
  }
}
