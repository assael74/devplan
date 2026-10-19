// src/features/playersDatabase/ui/providers/PlayersDatabaseReadScope.js

import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { subscribeClubsDirectoryDocument } from '../../services/read/pages/clubs.read.js'
import { subscribeLeagueCenterData } from '../../services/read/pages/leagueCenter.read.js'
import { clearPlayersDatabaseDocumentCache } from '../../services/cache/index.js'

export default function PlayersDatabaseReadScope() {
  const { pathname } = useLocation()
  const isDatabasePage = pathname === '/players-database' || pathname.startsWith('/players-database/')
  const centerSubscription = useRef(null)

  useEffect(() => {
    if (!isDatabasePage || centerSubscription.current) return undefined

    let cancelled = false
    // Wait for the committed mount so StrictMode's setup/cleanup probe opens no source.
    Promise.resolve().then(() => {
      if (!cancelled && !centerSubscription.current) {
        centerSubscription.current = subscribeLeagueCenterData()
      }
    })

    return () => { cancelled = true }
  }, [isDatabasePage])

  useEffect(() => {
    if (!isDatabasePage) return undefined
    return subscribeClubsDirectoryDocument()
  }, [isDatabasePage])

  useEffect(() => () => {
    if (centerSubscription.current) centerSubscription.current()
    centerSubscription.current = null
    clearPlayersDatabaseDocumentCache()
  }, [])

  return <Outlet />
}
