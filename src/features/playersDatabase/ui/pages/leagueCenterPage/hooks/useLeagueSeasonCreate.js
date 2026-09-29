// features/playersDatabase/ui/pages/leagueCenterPage/hooks/useLeagueSeasonCreate.js

import * as React from 'react'

export default function useLeagueSeasonCreate() {
  const [league, setLeague] = React.useState(null)
  const busy = false
  const [writeReport, setWriteReport] = React.useState(null)

  const open = React.useCallback(row => {
    setLeague(row)
  }, [])

  const close = React.useCallback(() => {
    if (busy) return
    setLeague(null)
  }, [busy])

  // The button/modal intentionally remain visible, but season creation is
  // disconnected until a new explicit writeV2 action is defined.
  const confirm = React.useCallback(async () => null, [])

  return {
    league,
    busy,
    open,
    close,
    confirm,
    writeReport,
    closeWriteReport: () => setWriteReport(null),
  }
}
