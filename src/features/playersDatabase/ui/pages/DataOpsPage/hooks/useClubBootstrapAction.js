// src/features/playersDatabase/ui/pages/DataOpsPage/hooks/useClubBootstrapAction.js

import { useCallback, useState } from 'react'

import { useSnackbar } from '../../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import { mapFirestoreErrorToDetails } from '../../../../../../ui/core/feedback/snackbar/snackbar.format.js'
import { SNACK_STATUS } from '../../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import { bootstrapClubs } from '../../../../services/write/club/index.js'

export default function useClubBootstrapAction() {
  const { notify } = useSnackbar()
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const run = useCallback(async () => {
    if (running) return null

    setRunning(true)
    setError('')

    try {
      const nextResult = await bootstrapClubs()
      const written = nextResult.writeResult.written === true
      setResult(nextResult)
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: written ? 'אתחול המועדונים הושלם' : 'המועדונים כבר מאותחלים',
        message: written
          ? `${nextResult.writeResult.clubsCount} מועדונים נבנו מהקטלוג הפנימי`
          : 'המסמכים הקיימים תואמים לקטלוג הפנימי',
      })
      return nextResult
    } catch (runError) {
      const message = mapFirestoreErrorToDetails(runError)
      setError(message)
      notify({
        status: SNACK_STATUS.ERROR,
        title: 'אתחול המועדונים נכשל',
        message,
      })
      throw runError
    } finally {
      setRunning(false)
    }
  }, [notify, running])

  return {
    running,
    result,
    error,
    run,
    clearError: () => setError(''),
  }
}

