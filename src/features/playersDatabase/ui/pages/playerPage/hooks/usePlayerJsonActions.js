import * as React from 'react'

import {
  canReadPlayerSearchIndexExport,
  canReadTeamSearchIndexExport,
  readPlayerSearchIndexExport,
  readPlayerSource,
  readTeamSearchIndexExport,
} from '../../../../services/read/index.js'
import {
  downloadPlayerJson,
  downloadPlayerSearchIndexJson,
  downloadTeamJson,
  downloadTeamSeasonJson,
  downloadTeamSearchIndexJson,
} from '../logic/playerJson.logic.js'

export default function usePlayerJsonActions({
  player,
  playerId,
  teamSource,
  notify,
}) {
  const [playerJsonLoading, setPlayerJsonLoading] = React.useState(false)
  const [searchIndexJsonLoading, setSearchIndexJsonLoading] = React.useState(false)

  const downloadPlayer = React.useCallback(async () => {
    if (!playerId || playerJsonLoading) return

    setPlayerJsonLoading(true)
    try {
      const playerDocument = await readPlayerSource({ playerId })

      if (!playerDocument) {
        notify({
          status: 'error',
          message: 'לא נמצא מסמך שחקן ליצוא.',
        })
        return
      }

      downloadPlayerJson(playerDocument)
      notify({
        status: 'success',
        message: 'קובץ JSON נוצר בהצלחה.',
      })
    } catch (error) {
      console.error('Player JSON export failed', error)
      notify({
        status: 'error',
        message: 'יצירת קובץ JSON נכשלה.',
      })
    } finally {
      setPlayerJsonLoading(false)
    }
  }, [notify, playerId, playerJsonLoading])

  const downloadTeam = React.useCallback(() => {
    const teamDocument = teamSource?.teamDoc

    if (!teamDocument) {
      notify({
        status: 'warning',
        message: 'מסמך הקבוצה אינו זמין כרגע להורדה.',
      })
      return
    }

    downloadTeamJson(teamDocument)
    notify({
      status: 'success',
      message: 'מסמך הקבוצה הורד בהצלחה.',
    })
  }, [notify, teamSource])

  const downloadTeamSeason = React.useCallback(() => {
    const teamSeasonDocument = teamSource?.selectedTeamSeason

    if (!teamSeasonDocument) {
      notify({
        status: 'warning',
        message: 'נתוני קבוצת העונה אינם זמינים כרגע להורדה.',
      })
      return
    }

    downloadTeamSeasonJson(teamSeasonDocument)
    notify({
      status: 'success',
      message: 'נתוני קבוצת העונה הורדו בהצלחה.',
    })
  }, [notify, teamSource])

  const downloadSearchIndex = React.useCallback(async ({ type } = {}) => {
    if (searchIndexJsonLoading) return

    const isPlayerIndex = type === 'player'
    const canRead = isPlayerIndex
      ? canReadPlayerSearchIndexExport(player)
      : canReadTeamSearchIndexExport(player)

    if (!canRead) {
      notify({
        status: 'warning',
        message: 'אין הקשר עונה מלא לטעינת מסמך האינדקס.',
      })
      return
    }

    setSearchIndexJsonLoading(true)
    try {
      const searchIndexDocument = isPlayerIndex
        ? await readPlayerSearchIndexExport({ player })
        : await readTeamSearchIndexExport({ player })

      if (!searchIndexDocument) {
        notify({
          status: 'warning',
          message: 'לא נמצא מסמך אינדקס עבור ההקשר הנבחר.',
        })
        return
      }

      if (isPlayerIndex) {
        downloadPlayerSearchIndexJson(searchIndexDocument)
      } else {
        downloadTeamSearchIndexJson(searchIndexDocument)
      }

      notify({
        status: 'success',
        message: 'מסמך האינדקס הורד בהצלחה.',
      })
    } catch (error) {
      console.error('Search index JSON export failed', error)
      notify({
        status: 'error',
        message: 'הורדת מסמך האינדקס נכשלה.',
      })
    } finally {
      setSearchIndexJsonLoading(false)
    }
  }, [notify, player, searchIndexJsonLoading])

  return {
    playerJsonLoading,
    searchIndexJsonLoading,
    teamJsonAvailable: Boolean(teamSource?.teamDoc),
    teamSeasonJsonAvailable: Boolean(teamSource?.selectedTeamSeason),
    playerSearchIndexJsonAvailable: canReadPlayerSearchIndexExport(player),
    teamSearchIndexJsonAvailable: canReadTeamSearchIndexExport(player),
    downloadPlayer,
    downloadTeam,
    downloadTeamSeason,
    downloadSearchIndex,
  }
}
