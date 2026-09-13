import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  readClubPageDocument,
  readClubsMasterDocument,
} from '../../../../services/read/index.js'
import { buildClubPageModel } from '../../../../model/pages/clubPresentation.model.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

export default function useClubPage({ clubId } = {}) {
  const [clubsMasterDoc, setClubsMasterDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const normalizedClubId = clean(clubId)

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [masterDocument, clubDocument] = await Promise.all([
        readClubsMasterDocument(),
        readClubPageDocument({ clubId: normalizedClubId }),
      ])
      setClubsMasterDoc({ masterDocument, clubDocument })
      return masterDocument
    } catch (loadError) {
      setClubsMasterDoc(null)
      setError(loadError?.message || 'טעינת המועדון נכשלה')
      throw loadError
    } finally {
      setLoading(false)
    }
  }, [normalizedClubId])

  useEffect(() => {
    reload().catch(() => {})
  }, [reload])

  const club = useMemo(() => (
    clubsMasterDoc?.clubDocument ||
    (Array.isArray(clubsMasterDoc?.masterDocument?.clubs) ? clubsMasterDoc.masterDocument.clubs : [])
      .find(item => clean(item?.clubId) === normalizedClubId) || null
  ), [clubsMasterDoc, normalizedClubId])

  const page = useMemo(() => buildClubPageModel({ club }), [club])

  return {
    club,
    page,
    loading,
    error,
    notFound: Boolean(clubsMasterDoc && !club),
  }
}
