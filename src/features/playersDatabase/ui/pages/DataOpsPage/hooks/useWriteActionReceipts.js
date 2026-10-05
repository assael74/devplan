// src/features/playersDatabase/ui/pages/DataOpsPage/hooks/useWriteActionReceipts.js

import { useCallback, useEffect, useState } from 'react'

import {
  getWriteActionReceipt,
  listWriteActionReceipts,
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

export default function useWriteActionReceipts() {
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [repairing, setRepairing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [checkingSync, setCheckingSync] = useState(false)
  const [syncCheck, setSyncCheck] = useState(null)
  const [syncCheckError, setSyncCheckError] = useState('')

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const rows = await listWriteActionReceipts({ maxResults: 50 })
      setReceipts(rows)
      return rows
    } catch (loadError) {
      setError(messageFromError(loadError))
      throw loadError
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    load().catch(() => {})
  }, [load])

  const openReceipt = useCallback(async receiptId => {
    setDetailsLoading(true)
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
      setDetailsLoading(false)
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
    setSyncCheckError('')
    try {
      const result = await auditWriteActionReceipt({ receiptId })
      setSyncCheck(result.audit)
      return result.audit
    } catch (checkError) {
      setSyncCheckError(messageFromError(checkError))
      throw checkError
    } finally {
      setCheckingSync(false)
    }
  }, [selectedReceipt])

  const repairReceipt = useCallback(async () => {
    const receiptId = selectedReceipt && selectedReceipt.id
    if (!receiptId) throw new Error('חסר מזהה קבלה')
    setRepairing(true)
    setActionError('')
    try {
      const result = await repairWriteActionReceipt({ receiptId })
      const [receipt] = await Promise.all([
        getWriteActionReceipt({ receiptId }),
        load({ refresh: true }),
      ])
      setSelectedReceipt(receipt)
      return result
    } catch (repairError) {
      setActionError(messageFromError(repairError))
      throw repairError
    } finally {
      setRepairing(false)
    }
  }, [load, selectedReceipt])

  const repairEligibility = inspectWriteActionRepair(selectedReceipt)

  return {
    receipts,
    loading,
    refreshing,
    error,
    selectedReceipt,
    detailsLoading,
    repairing,
    actionError,
    checkingSync,
    syncCheck,
    syncCheckError,
    repairEligibility,
    openReceipt,
    closeReceipt,
    repairReceipt,
    checkReceiptSync,
    reload: () => load({ refresh: true }),
  }
}

