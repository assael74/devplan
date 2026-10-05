// src/features/playersDatabase/ui/providers/PlayersDatabaseReadScope.js

import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import {
  subscribeClubsDirectoryDocument,
  subscribeLeagueCenterData,
} from '../../services/read/index.js'

export default function PlayersDatabaseReadScope() {
  useEffect(() => {
    const unsubscribeDirectory = subscribeClubsDirectoryDocument()
    const unsubscribeLeaguesCenter = subscribeLeagueCenterData()

    return () => {
      unsubscribeDirectory()
      unsubscribeLeaguesCenter()
    }
  }, [])

  return <Outlet />
}
