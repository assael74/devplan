// src/services/firestore/shorts/deleteTeamCascadeData.js

import { Timestamp } from 'firebase/firestore'
import { db } from '../../firebase/firebase.js'
import { trackedRunTransaction } from '../usage/firestoreUsage.instrumentation.js'
import { shortsRefs } from './shorts.refs.js'
import { SHORTS_DEBUG } from './shortsDebug.config.js'
import { buildShortDocRef, readShortListDoc } from './gameStats/shared/gameStats.firestore.js'
import { planTeamGameStatsDeletion } from './gameStats/gameStatsDelete.js'

const groupNames = {
  teams: 'teamsShorts',
  clubs: 'clubsShorts',
  players: 'playersShorts',
  games: 'gamesShorts',
  meetings: 'meetingsShorts',
  payments: 'paymentsShorts',
}

async function readTeamShorts(tx, shortKeys) {
  const docs = await Promise.all(shortKeys.map(async shortKey => {
    const [group, name] = shortKey.split('.')
    const ref = buildShortDocRef(shortsRefs[group][name])
    const { data, list } = await readShortListDoc(tx, ref)
    return { shortKey, group, ref, data, list }
  }))
  const shorts = {}

  for (const { shortKey, group, list } of docs) {
    const bucket = groupNames[group]
    if (!shorts[bucket]) shorts[bucket] = {}
    shorts[bucket][shortKey] = list
  }

  return { docs, shorts }
}

export async function deleteTeamCascadeData({
  teamId,
  keys,
  resolvePlan,
  archivePayment,
}) {
  const shortKeys = [...Object.values(keys).flat(), 'clubs.clubsInfo']
  const now = Timestamp.now()
  const dryRun = SHORTS_DEBUG.dryRun

  return trackedRunTransaction(db, async tx => {
    const { docs, shorts } = await readTeamShorts(tx, shortKeys)
    if (!shorts.teamsShorts['teams.teamsInfo'].some(team => team?.id === teamId)) {
      throw new Error('הקבוצה כבר אינה קיימת')
    }

    const plan = resolvePlan(shorts)
    const idsByGroup = {
      teams: new Set([teamId]),
      players: new Set(plan.playerIds),
      games: new Set(plan.gameIds),
      meetings: new Set(plan.meetingIds),
      payments: new Set(plan.paymentIds),
    }
    const playerStatsKey = 'players.playersStats'
    const playersStatsList = shorts.playersShorts[playerStatsKey].filter(
      player => !idsByGroup.players.has(player?.id)
    )
    const candidates = new Set(plan.statsRefs.map(stats => stats.gameId))
    const stats = await planTeamGameStatsDeletion(tx, {
      teamId,
      games: plan.games.filter(game => candidates.has(game.id)),
      playersStatsList,
      now,
    })

    const changes = []
    for (const doc of docs) {
      const ids = idsByGroup[doc.group]
      if (!ids?.size && doc.shortKey !== playerStatsKey) continue

      let list
      if (doc.group === 'payments') {
        list = doc.list.map(item => ids.has(item?.id) ? archivePayment(item, plan) : item)
      } else if (doc.shortKey === playerStatsKey) {
        list = stats.list
      } else {
        list = doc.list.filter(item => !ids.has(item?.id))
      }

      if (list.length !== doc.list.length || list.some((item, index) => item !== doc.list[index])) {
        changes.push({ ref: doc.ref, data: { ...doc.data, list } })
      }
    }

    if (!dryRun) {
      for (const { ref, data } of changes) tx.set(ref, data, { merge: true })
      for (const ref of stats.refs) tx.delete(ref)
    }

    return { plan, dryRun }
  }, { feature: 'hub', action: 'team-cascade-delete' })
}
