// src/features/playersDatabase/ui/pages/DataOpsPage/hooks/useWriteActionReceipts.js

import { useCallback, useEffect, useState } from 'react'

import {
  deleteOldClosedReceipts,
  getWriteActionReceipt,
  listOldClosedReceipts,
  listProblemReceipts,
  listWriteActionReceiptHistory,
} from '../../../../services/write/receipt/index.js'
import {
  auditWriteActionReceipt,
  inspectWriteActionRepair,
  repairWriteActionReceipt,
} from '../../../../services/write/recovery/index.js'

const messageFromError = error => (
  error instanceof Error && error.message
    ? error.message
    : 'טעינת הקבלות נכשלה'
)

export default function useWriteActionReceipts({ autoLoad = true, maxProblemResults = 20 } = {}) {
  const [problemReceipts, setProblemReceipts] = useState([])
  const [historyReceipts, setHistoryReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [cleanupReceipts, setCleanupReceipts] = useState([])
  const [cleanupLoading, setCleanupLoading] = useState(false)
  const [cleanupDeleting, setCleanupDeleting] = useState(false)
  const [cleanupError, setCleanupError] = useState('')
  const [error, setError] = useState('')
  const [historyError, setHistoryError] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [detailsLoadingId, setDetailsLoadingId] = useState('')
  const [repairing, setRepairing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [checkingSync, setCheckingSync] = useState(false)
  const [syncCheck, setSyncCheck] = useState(null)
  const [syncCheckError, setSyncCheckError] = useState('')

  const loadProblems = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const rows = await listProblemReceipts({ maxResults: maxProblemResults })
      setProblemReceipts(rows)
      return rows
    } catch (loadError) {
      setError(messageFromError(loadError))
      throw loadError
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [maxProblemResults])

  useEffect(() => {
    if (!autoLoad) {
      setLoading(false)
      return
    }
    loadProblems().catch(() => {})
  }, [autoLoad, loadProblems])

  const loadHistory = useCallback(async ({
    maxResults = 25,
    fromDate = null,
    actionType = '',
  } = {}) => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      const rows = await listWriteActionReceiptHistory({ maxResults, fromDate })
      const filtered = actionType
        ? rows.filter(receipt => receipt.actionType === actionType)
        : rows
      setHistoryReceipts(filtered)
      setHistoryLoaded(true)
      return filtered
    } catch (loadError) {
      setHistoryError(messageFromError(loadError))
      throw loadError
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const loadCleanupReceipts = useCallback(async ({ beforeDate, maxResults = 100 } = {}) => {
    setCleanupLoading(true)
    setCleanupError('')
    try {
      const rows = await listOldClosedReceipts({ beforeDate, maxResults })
      setCleanupReceipts(rows)
      return rows
    } catch (loadError) {
      setCleanupError(messageFromError(loadError))
      throw loadError
    } finally {
      setCleanupLoading(false)
    }
  }, [])

  const deleteCleanupReceipts = useCallback(async ({ beforeDate } = {}) => {
    setCleanupDeleting(true)
    setCleanupError('')
    try {
      const deletedIds = await deleteOldClosedReceipts({
        receiptIds: cleanupReceipts.map(receipt => receipt.id),
        beforeDate,
      })
      setCleanupReceipts([])
      return deletedIds
    } catch (deleteError) {
      setCleanupError(messageFromError(deleteError))
      throw deleteError
    } finally {
      setCleanupDeleting(false)
    }
  }, [cleanupReceipts])

  const openReceipt = useCallback(async receiptId => {
    setDetailsLoadingId(receiptId)
    setActionError('')
    setSyncCheck(null)
    setSyncCheckError('')
    try {
      const receipt = await getWriteActionReceipt({ receiptId })
      setSelectedReceipt(receipt)
      return receipt
    } catch (detailsError) {
      setActionError(messageFromError(detailsError))
      throw detailsError
    } finally {
      setDetailsLoadingId('')
    }
  }, [])

  const closeReceipt = useCallback(() => {
    if (repairing || checkingSync) return
    setSelectedReceipt(null)
    setActionError('')
    setSyncCheck(null)
    setSyncCheckError('')
  }, [checkingSync, repairing])

  const checkReceiptSync = useCallback(async () => {
    const receiptId = selectedReceipt && selectedReceipt.id
    if (!receiptId) throw new Error('חסר מזהה קבלה')
    setCheckingSync(true)
    setSyncCheck(null)
    setSyncCheckError('')
    try {
      const result = await auditWriteActionReceipt({ receiptId, closeIfClean: true })
      const [receipt] = await Promise.all([
        getWriteActionReceipt({ receiptId }),
        loadProblems({ refresh: true }),
      ])
      setSelectedReceipt(receipt)
      setHistoryReceipts(current => current.map(item => item.id === receiptId ? receipt : item))
      setSyncCheck(result.audit)
      return result.audit
    } catch (checkError) {
      setSyncCheckError(messageFromError(checkError))
      throw checkError
    } finally {
      setCheckingSync(false)
    }
  }, [loadProblems, selectedReceipt])

  const syncClean = Boolean(
    syncCheck &&
    String(syncCheck.status || syncCheck.result || '').toUpperCase() === 'CLEAN' &&
    syncCheck.coverage?.complete === true &&
    Array.isArray(syncCheck.findings) &&
    syncCheck.findings.length === 0
  )

  const repairReceipt = useCallback(async () => {
    if (syncClean || checkingSync || repairing) return
    const receiptId = selectedReceipt && selectedReceipt.id
    if (!receiptId) throw new Error('חסר מזהה קבלה')
    setRepairing(true)
    setActionError('')
    try {
      const result = await repairWriteActionReceipt({ receiptId })
      const [receipt] = await Promise.all([
        getWriteActionReceipt({ receiptId }),
        loadProblems({ refresh: true }),
      ])
      setSelectedReceipt(receipt)
      return result
    } catch (repairError) {
      setActionError(messageFromError(repairError))
      throw repairError
    } finally {
      setRepairing(false)
    }
  }, [checkingSync, loadProblems, repairing, selectedReceipt, syncClean])

  const repairEligibility = inspectWriteActionRepair(selectedReceipt)

  return {
    problemReceipts,
    historyReceipts,
    loading,
    refreshing,
    historyLoading,
    historyLoaded,
    cleanupReceipts,
    cleanupLoading,
    cleanupDeleting,
    error,
    historyError,
    cleanupError,
    selectedReceipt,
    detailsLoadingId,
    repairing,
    actionError,
    checkingSync,
    syncCheck,
    syncClean,
    syncCheckError,
    repairEligibility,
    openReceipt,
    closeReceipt,
    repairReceipt,
    checkReceiptSync,
    loadHistory,
    loadCleanupReceipts,
    deleteCleanupReceipts,
    reload: () => loadProblems({ refresh: true }),
  }
}

