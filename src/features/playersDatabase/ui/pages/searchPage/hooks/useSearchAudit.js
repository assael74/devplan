import * as React from 'react'

import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'
import {
  previewMissingPlayerDocumentRepair,
  buildAuditFindingId,
  getPlayersDatabaseWriteAction,
  listRecentPlayersDatabaseWriteActions,
  repairMissingPlayerDocuments,
  runPlayerDatabaseAudit,
} from '../../../../services/audit/index.js'
import {
  repairPlayerSearchIndexesFromAuditFindings,
  repairTeamSearchIndexesFromAuditFindings,
  deleteOrphanPlayerSearchIndexesFromAuditFindings,
  resetOrphanTeamSearchIndexesFromAuditFindings,
} from '../../../../services/dataRepair/searchIndex/searchIndexBulkRepair.js'
import {
  rebuildAllClubsMasterDocument,
  rebuildClubProjectionsFromAuditFindings,
  rebuildClubProjectionsFromAllLeagueTables,
  repairOrphanedClubCompetitionPathSeasons,
} from '../../../../services/dataRepair/club/index.js'
import { retryMovementCounterpartsFromAuditFindings } from '../../../../services/dataRepair/team/index.js'
import { syncRosterTeamProjectionFromCanonicalV2 } from '../../../../services/writeV2/roster/index.js'
import {
  getWriteActionReceiptV2,
  listWriteActionReceiptsV2,
  saveWriteActionAuditSummaryV2,
} from '../../../../services/writeV2/index.js'
import { auditLeagueV2 } from '../../../../services/auditV2/index.js'
import { buildPartialAuditDefaults } from '../logic/searchAuditScope.logic.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export default function useSearchAudit({ rows }) {
  const [open, setOpen] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [repairPlan, setRepairPlan] = React.useState(null)
  const [orphanIndexDeletePlan, setOrphanIndexDeletePlan] = React.useState(null)
  const [repairPreviewBusy, setRepairPreviewBusy] = React.useState(false)
  const [repairProgress, setRepairProgress] = React.useState(null)
  const [recentWriteActions, setRecentWriteActions] = React.useState([])
  const [recentWriteActionsBusy, setRecentWriteActionsBusy] = React.useState(false)
  const [recentWriteActionReceiptsV2, setRecentWriteActionReceiptsV2] = React.useState([])
  const [recentWriteActionReceiptsV2Busy, setRecentWriteActionReceiptsV2Busy] = React.useState(false)

  const partialAuditDefaults = React.useMemo(
    () => buildPartialAuditDefaults(rows),
    [rows]
  )

  const refreshAudit = React.useCallback(async () => {
    const nextResult = await runPlayerDatabaseAudit({
      scope: result?.scope,
    })
    setResult(nextResult)
    return nextResult
  }, [result])

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
    setRepairProgress(null)

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
    setRepairProgress(null)
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
    setRepairProgress(null)

    try {
      const receipt = await getWriteActionReceiptV2({ receiptId: id })
      if (!receipt) throw new Error('Receipt V2 לא נמצא.')

      if (receipt.flowType !== 'league') {
        throw new Error(`Audit V2 עבור ${receipt.flowType || 'flow לא ידוע'} עדיין לא מיושם.`)
      }

      const auditTarget = receipt.auditTarget || {}
      const nextResult = await auditLeagueV2({
        leagueId: clean(auditTarget.leagueId),
        seasonKey: clean(auditTarget.seasonKey),
      })
      const ranAt = new Date().toISOString()

      await saveWriteActionAuditSummaryV2({
        receiptId: id,
        ranAt,
        coverage: nextResult.coverage?.complete ? 'complete' : 'partial',
        findingsCount: nextResult.findings?.length || 0,
        checkedDomains: nextResult.coverage?.coveredTargets || [],
      })

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
  }, [busy])

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

  const requestRepair = React.useCallback(async findings => {
    if (busy || repairPreviewBusy) return
    setRepairPreviewBusy(true)
    setError('')

    try {
      const plan = await previewMissingPlayerDocumentRepair({ findings })
      if (!plan.playersCount) {
        setError('לא נמצאו מסמכי שחקן חסרים שמוכנים לתיקון.')
        return
      }
      setRepairPlan({
        findings: Array.isArray(findings) ? findings : [],
        ...plan,
      })
    } catch (repairError) {
      console.error('[playersDatabase] Player document repair preview failed:', repairError)
      setError(
        repairError instanceof Error
          ? repairError.message
          : 'טעינת רשימת התיקון נכשלה'
      )
    } finally {
      setRepairPreviewBusy(false)
    }
  }, [busy, repairPreviewBusy])

  const confirmRepair = React.useCallback(async () => {
    if (!repairPlan?.findings?.length || busy) return
    setBusy(true)
    setError('')

    try {
      await repairMissingPlayerDocuments({ findings: repairPlan.findings })
      await refreshAudit()
      setRepairPlan(null)
    } catch (repairError) {
      console.error('[playersDatabase] Player document repair failed:', repairError)
      setError(
        repairError instanceof Error
          ? repairError.message
          : 'תיקון מסמכי השחקן נכשל'
      )
    } finally {
      setBusy(false)
    }
  }, [busy, refreshAudit, repairPlan])

  const runRepair = React.useCallback(async ({ action, failureMessage }) => {
    if (busy) return
    setBusy(true)
    setError('')
    setRepairProgress(null)

    try {
      await action({ onProgress: setRepairProgress })
      await refreshAudit()
    } catch (repairError) {
      setError(
        repairError instanceof Error
          ? repairError.message
          : failureMessage
      )
    } finally {
      setBusy(false)
    }
  }, [busy, refreshAudit])

  const repairPlayerIndexes = React.useCallback(findings => runRepair({
    action: async () => {
      const repairResult = await repairPlayerSearchIndexesFromAuditFindings({ findings })
      if (repairResult.failures.length) {
        setError(`${repairResult.failures.length} אינדקסי שחקנים לא תוקנו. התיקונים האחרים הושלמו.`)
      }
    },
    failureMessage: 'תיקון אינדקסי השחקנים נכשל',
  }), [runRepair])

  const requestOrphanPlayerIndexDelete = React.useCallback(findings => {
    if (busy) return
    const safeFindings = Array.isArray(findings) ? findings : []
    if (safeFindings.length) setOrphanIndexDeletePlan(safeFindings)
  }, [busy])

  const confirmOrphanPlayerIndexDelete = React.useCallback(async () => {
    if (!orphanIndexDeletePlan?.length || busy) return
    setBusy(true)
    setError('')

    try {
      const deleteResult = await deleteOrphanPlayerSearchIndexesFromAuditFindings({
        findings: orphanIndexDeletePlan,
      })
      if (deleteResult.skipped.length) {
        setError(`${deleteResult.skipped.length} אינדקסים לא נמחקו כי מקור הנתונים השתנה מאז האודיט.`)
      }
      await refreshAudit()
      setOrphanIndexDeletePlan(null)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'מחיקת אינדקסי השחקנים נכשלה'
      )
    } finally {
      setBusy(false)
    }
  }, [busy, orphanIndexDeletePlan, refreshAudit])

  const repairRosterTeamProjectionFromCanonical = React.useCallback(findings => runRepair({
    action: async () => {
      const targets = [...new Map((Array.isArray(findings) ? findings : [])
        .map(finding => {
          const birthTeamDocumentId = clean(finding?.teamDocumentId)
          const seasonKey = clean(finding?.seasonKey)
          return [`${birthTeamDocumentId}__${seasonKey}`, { birthTeamDocumentId, seasonKey }]
        })
        .filter(([key, target]) => key !== '__' && target.birthTeamDocumentId && target.seasonKey)
      ).values()]
      const failures = []

      for (const target of targets) {
        try {
          await syncRosterTeamProjectionFromCanonicalV2(target)
        } catch (repairError) {
          failures.push({
            ...target,
            message: repairError?.message || 'סנכרון נתוני הקבוצה נכשל',
          })
        }
      }

      if (failures.length) {
        setError(`${failures.length} תיקוני Team Projection נכשלו.`)
      }
    },
    failureMessage: 'סנכרון נתוני קבוצה מהקנוני נכשל',
  }), [runRepair])
  const repairTeamIndexes = React.useCallback(findings => runRepair({
    action: async () => {
      const repairResult = await repairTeamSearchIndexesFromAuditFindings({ findings })
      if (repairResult.failures.length) {
        setError(`${repairResult.failures.length} אינדקסי קבוצות לא תוקנו. התיקונים האחרים הושלמו.`)
      }
    },
    failureMessage: 'תיקון אינדקסי הקבוצות נכשל',
  }), [runRepair])

  const retryMovementCounterparts = React.useCallback(findings => runRepair({
    action: async () => {
      const repairResult = await retryMovementCounterpartsFromAuditFindings({ findings })
      if (repairResult.failures.length) {
        setError(`${repairResult.failures.length} השלמות Movement נכשלו. העובדות המקומיות נשארו תקינות.`)
      }
    },
    failureMessage: 'השלמת counterparts של Movements נכשלה',
  }), [runRepair])

  const resetOrphanTeamIndexes = React.useCallback(findings => runRepair({
    action: async () => {
      const resetResult = await resetOrphanTeamSearchIndexesFromAuditFindings({ findings })
      if (resetResult.skipped.length) {
        setError(`${resetResult.skipped.length} אינדקסי קבוצה לא אופסו כי המקור הקנוני חסר או השתנה.`)
      }
    },
    failureMessage: 'איפוס אינדקסי הקבוצות נכשל',
  }), [runRepair])

  const repairClubsMaster = React.useCallback(() => runRepair({
    action: () => rebuildAllClubsMasterDocument({
      lastWriteAction: 'REPAIR_CLUBS_MASTER',
    }),
    failureMessage: 'סנכרון Clubs Master נכשל',
  }), [runRepair])

  const refreshClubsMaster = React.useCallback(() => runRepair({
    action: () => rebuildAllClubsMasterDocument({
      lastWriteAction: 'REFRESH_CLUBS_MASTER',
    }),
    failureMessage: 'רענון Clubs Master נכשל',
  }), [runRepair])

  const refreshClubProjections = React.useCallback(() => runRepair({
    action: async ({ onProgress }) => {
      const repairResult = await rebuildClubProjectionsFromAllLeagueTables({
        lastWriteAction: 'REFRESH_ALL_CLUB_PROJECTIONS',
        onProgress,
      })
      if (!repairResult.completed) {
        setError(`${repairResult.failures.length} קבוצות לא רועננו. Clubs Master לא עודכן.`)
      }
    },
    failureMessage: 'רענון מסמכי המועדונים נכשל',
  }), [runRepair])

  const repairClubProjections = React.useCallback(findings => runRepair({
    action: async () => {
      const repairResult = await rebuildClubProjectionsFromAuditFindings({ findings })
      if (!repairResult.completed) {
        setError(`${repairResult.failures.length} קבוצות לא סונכרנו למועדונים. לא בוצע סנכרון Clubs Master.`)
      }
    },
    failureMessage: 'סנכרון קבוצות הליגה למועדונים נכשל',
  }), [runRepair])

  const repairClubCompetitionPaths = React.useCallback(findings => runRepair({
    action: async () => {
      const repairResult = await repairOrphanedClubCompetitionPathSeasons({ findings })
      if (repairResult.failures.length) {
        setError(`${repairResult.failures.length} מסמכי מועדון לא נוקו. התיקונים האחרים הושלמו.`)
      }
    },
    failureMessage: 'ניקוי מסלולי ליגה יתומים נכשל',
  }), [runRepair])

  return {
    open,
    busy,
    error,
    result,
    repairPlan,
    orphanIndexDeletePlan,
    repairPreviewBusy,
    repairProgress,
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
    loadRecentWriteActions,
    loadRecentWriteActionReceiptsV2,
    openPlayer,
    openTeam,
    openLeague,
    openLeaguesCenter,
    requestRepair,
    confirmRepair,
    repairPlayerIndexes,
    requestOrphanPlayerIndexDelete,
    confirmOrphanPlayerIndexDelete,
    repairRosterTeamProjectionFromCanonical,
    repairTeamIndexes,
    retryMovementCounterparts,
    resetOrphanTeamIndexes,
    repairClubsMaster,
    refreshClubsMaster,
    refreshClubProjections,
    repairClubProjections,
    repairClubCompetitionPaths,
    clearRepairPlan: () => setRepairPlan(null),
    clearOrphanIndexDeletePlan: () => setOrphanIndexDeletePlan(null),
  }
}
