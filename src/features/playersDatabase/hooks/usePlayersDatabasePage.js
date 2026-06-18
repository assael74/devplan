import { useEffect, useState } from 'react'

import { getPlayersDatabaseKpis } from '../services/playersDatabasePlayers.service.js'

export function usePlayersDatabasePage() {
  const [kpis, setKpis] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    async function loadKpis() {
      const nextKpis = await getPlayersDatabaseKpis()

      if (!alive) return
      setKpis(nextKpis)
    }

    loadKpis().catch((err) => {
      if (!alive) return
      setError(err?.message || 'טעינת נתוני מאגר נכשלה')
    })

    return () => {
      alive = false
    }
  }, [])

  return {
    kpis,
    error,
    actions: {
      openImport: () => {},
      openSegments: () => {},
      openTrackedPlayers: () => {},
      openLeaguesTeams: () => {},
    },
  }
}
