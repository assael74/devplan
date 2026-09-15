// features/playersDatabase/ui/hooks/usePlayersDatabaseEntry.js

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  buildClubSeasonIdentityScopesFromLeaguesMaster,
  readClubSeasonIdentityIndexes,
  readLeaguesMasterDocument,
} from '../../services/read/index.js'

export function usePlayersDatabaseEntry() {
  const [masterDocument, setMasterDocument] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    readLeaguesMasterDocument()
      .then(doc => {
        if (!active) return
        setMasterDocument(doc)

        // Warm the compact locator documents in the background. This never
        // blocks the entry screen and does not read the large Clubs Master.
        readClubSeasonIdentityIndexes({
          scopes: buildClubSeasonIdentityScopesFromLeaguesMaster({
            leaguesMasterDoc: doc,
          }),
        }).catch(() => {})
      })
      .catch(nextError => {
        if (!active) return
        setMasterDocument(null)
        setError(nextError?.message || 'טעינת מסמך האב נכשלה')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const summary = useMemo(() => (
    masterDocument?.summary || {}
  ), [masterDocument])

  return {
    masterDocument,
    summary,
    loading,
    error,
  }
}
