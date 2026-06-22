import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'

import { db } from '../../../services/firebase/firebase.js'
import {
  trackFirestoreRead,
  trackFirestoreTransaction,
} from '../../../services/firestore/usage/index.js'
import { buildTeamIdentity } from '../catalog/teamIdentity.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../constants/playersDatabase.constants.js'

const clean = (value) => String(value ?? '').trim()
const FEATURE = 'playersDatabase'

const leagueRef = (leagueId) =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, clean(leagueId))

const leaguesRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.leagues)

const snapRef = (snapshotId) =>
  doc(db, PLAYERS_DATABASE_COLLECTIONS.leagueSnapshots, clean(snapshotId))

const snapsRef = () =>
  collection(db, PLAYERS_DATABASE_COLLECTIONS.leagueSnapshots)

const omitSeasonStateCounters = (season = {}) => {
  const {
    snapshotsCount,
    ...rest
  } = season

  return rest
}

const buildLeaguePatch = (league = {}, snapshot = {}) => {
  const seasonKey = clean(snapshot.seasonKey)
  const seasonState = league.seasons?.[seasonKey] || {}

  return {
    seasons: {
      [seasonKey]: {
        ...omitSeasonStateCounters(seasonState),
        clubIds: Array.isArray(seasonState.clubIds) ? seasonState.clubIds : [],
        loadedClubsCount: seasonState.loadedClubsCount ?? snapshot.loadedClubsCount ?? null,
        latestSnapshotId: clean(snapshot.id),
        latestSnapshotAt: clean(snapshot.capturedAt),
        snapshotsCount: increment(1),
      },
    },
    updatedAt: serverTimestamp(),
  }
}

export async function saveLeagueSnapshot(writePlan = {}, meta = {}) {
  const leagues = Array.isArray(writePlan.leaguesToUpsert) ? writePlan.leaguesToUpsert : []
  const snapshots = Array.isArray(writePlan.leagueSnapshotsToCreate) ? writePlan.leagueSnapshotsToCreate : []

  if (!leagues.length || !snapshots.length) {
    throw new Error('missing league snapshot write plan')
  }

  if (leagues.length !== snapshots.length) {
    throw new Error('league write plan mismatch')
  }

  let usagePayload = null

  const savedItems = await runTransaction(db, async (tx) => {
    const saved = []
    const leagueSnaps = []
    const snapshotSnaps = []

    for (let index = 0; index < leagues.length; index += 1) {
      const league = leagues[index]
      const snapshot = snapshots[index]
      leagueSnaps.push(await tx.get(leagueRef(league.id)))
      snapshotSnaps.push(await tx.get(snapRef(snapshot.id)))
    }

    for (let index = 0; index < snapshots.length; index += 1) {
      const league = leagues[index]
      const snapshot = snapshots[index]
      const lRef = leagueRef(league.id)
      const sRef = snapRef(snapshot.id)
      const leagueSnap = leagueSnaps[index]
      const snapshotSnap = snapshotSnaps[index]

      if (snapshotSnap.exists()) {
        throw new Error('snapshot already exists')
      }

      tx.set(sRef, {
        ...snapshot,
        source: {
          ...(snapshot.source || {}),
          ...meta.source,
        },
        createdAt: serverTimestamp(),
        createdBy: clean(meta.createdBy),
      }, { merge: false })

      tx.set(lRef, {
        id: clean(league.id),
        ...buildLeaguePatch(league, snapshot),
        createdAt: leagueSnap.exists() ? leagueSnap.data()?.createdAt : serverTimestamp(),
      }, { merge: true })

      saved.push({
        leagueId: league.id,
        snapshotId: snapshot.id,
      })
    }

    usagePayload = {
      leagueReadPayload: leagueSnaps.map((item) => item.exists() ? item.data() : null),
      snapshotReadPayload: snapshotSnaps.map((item) => item.exists() ? item.data() : null),
      leagueWritePayload: leagues,
      snapshotWritePayload: snapshots,
    }

    return saved
  })

  if (usagePayload) {
    trackFirestoreTransaction({
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      feature: FEATURE,
      action: 'saveLeagueSnapshot:league',
      readsCount: leagues.length,
      writesCount: leagues.length,
      readPayload: usagePayload.leagueReadPayload,
      writePayload: usagePayload.leagueWritePayload,
      meta: {
        flowType: writePlan.flowType || null,
        saved: savedItems,
      },
    })

    trackFirestoreTransaction({
      collection: PLAYERS_DATABASE_COLLECTIONS.leagueSnapshots,
      feature: FEATURE,
      action: 'saveLeagueSnapshot:snapshot',
      readsCount: snapshots.length,
      writesCount: snapshots.length,
      readPayload: usagePayload.snapshotReadPayload,
      writePayload: usagePayload.snapshotWritePayload,
      meta: {
        flowType: writePlan.flowType || null,
        saved: savedItems,
      },
    })
  }

  return savedItems
}

export async function ensureLeagueFromPlan(league = {}) {
  if (!league?.id) throw new Error('missing league id')

  const ref = leagueRef(league.id)
  let usagePayload = null

  const result = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const current = snap.exists() ? snap.data() : {}
    const nextLeague = {
      id: clean(league.id),
      catalogLeagueId: clean(league.catalogLeagueId),
      leagueName: clean(league.leagueName),
      level: league.level ?? null,
      region: clean(league.region),
      leagueNum: league.leagueNum ?? null,
      ageGroupId: clean(league.ageGroupId),
      ageGroupLabel: clean(league.ageGroupLabel),
      seasons: {
        ...(current.seasons || {}),
        ...(league.seasons || {}),
      },
      createdBy: current.createdBy || clean(league.createdBy),
      updatedBy: clean(league.updatedBy || league.createdBy),
    }

    tx.set(ref, {
      ...nextLeague,
      createdAt: current.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true })

    usagePayload = {
      readPayload: current,
      writePayload: nextLeague,
    }

    return { leagueId: league.id }
  })

  if (usagePayload) {
    trackFirestoreTransaction({
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      feature: FEATURE,
      action: 'ensureLeagueFromPlan',
      readsCount: 1,
      writesCount: 1,
      readPayload: usagePayload.readPayload,
      writePayload: usagePayload.writePayload,
      meta: {
        leagueId: league.id,
      },
    })
  }

  return result
}

export async function listLeagues() {
  const snap = await getDocs(leaguesRef())
  const rows = snap.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    feature: FEATURE,
    action: 'listLeagues',
    docs: rows,
    docsCount: snap.docs.length,
  })

  return rows
    .sort((a, b) => {
      if ((a.level || 0) !== (b.level || 0)) return (a.level || 0) - (b.level || 0)
      if (clean(a.ageGroupLabel) !== clean(b.ageGroupLabel)) {
        return clean(a.ageGroupLabel).localeCompare(clean(b.ageGroupLabel), 'he')
      }
      return clean(a.leagueName).localeCompare(clean(b.leagueName), 'he')
    })
}

export async function getLeague(leagueId) {
  const id = clean(leagueId)
  if (!id) return null

  const snap = await getDoc(leagueRef(id))
  const league = snap.exists()
    ? {
        id: snap.id,
        ...snap.data(),
      }
    : null

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
    feature: FEATURE,
    action: 'getLeague',
    docs: league,
    docsCount: 1,
  })

  return league
}

export async function getLeagueSnapshot(snapshotId) {
  const id = clean(snapshotId)
  if (!id) return null

  const snap = await getDoc(snapRef(id))
  const snapshot = snap.exists()
    ? {
        id: snap.id,
        ...snap.data(),
      }
    : null

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.leagueSnapshots,
    feature: FEATURE,
    action: 'getLeagueSnapshot',
    docs: snapshot,
    docsCount: 1,
  })

  return snapshot
}

export async function mergeLeagueTeamIndexFromDoc({
  targetLeagueId,
  sourceLeagueId,
} = {}) {
  const targetId = clean(targetLeagueId)
  const sourceId = clean(sourceLeagueId)

  if (!targetId || !sourceId || targetId === sourceId) {
    return { merged: false, added: 0 }
  }

  let usagePayload = null

  const result = await runTransaction(db, async (tx) => {
    const targetRef = leagueRef(targetId)
    const sourceRef = leagueRef(sourceId)
    const [targetSnap, sourceSnap] = await Promise.all([
      tx.get(targetRef),
      tx.get(sourceRef),
    ])

    if (!targetSnap.exists() || !sourceSnap.exists()) {
      return { merged: false, added: 0 }
    }

    const target = targetSnap.data() || {}
    const source = sourceSnap.data() || {}
    const targetIndex = target.teamsIndex || {}
    const sourceIndex = source.teamsIndex || {}
    const patch = Object.entries(sourceIndex).reduce((acc, [key, value]) => {
      if (!key) return acc

      const identity = buildTeamIdentity({
        clubId: value?.clubId,
        clubName: value?.clubName || value?.teamName,
        seasonId: value?.seasonId,
        ageGroupId: value?.ageGroupId,
        ageGroupLabel: value?.ageGroupLabel,
        teamSlot: value?.teamSlot,
        leagueId: targetId,
        leagueName: value?.leagueName,
        externalTeamId: value?.externalTeamId,
      })
      const targetKey =
        clean(identity.teamSeasonKey) ||
        clean(value?.teamSeasonKey).replace(sourceId, targetId) ||
        key.replace(sourceId, targetId)

      if (!targetKey || targetIndex[targetKey]) return acc

      acc[`teamsIndex.${targetKey}`] = {
        ...(value || {}),
        ...identity,
        leagueId: targetId,
        teamSeasonKey: targetKey,
        migratedFromLeagueId: sourceId,
        migratedFromTeamSeasonKey: clean(value?.teamSeasonKey || key),
        migratedAt: new Date().toISOString(),
      }

      return acc
    }, {})
    const added = Object.keys(patch).length

    if (!added) {
      return { merged: false, added: 0 }
    }

    tx.update(targetRef, {
      ...patch,
      updatedAt: serverTimestamp(),
    })

    usagePayload = {
      readPayload: {
        target,
        source,
      },
      writePayload: patch,
    }

    return { merged: true, added }
  })

  if (usagePayload) {
    trackFirestoreTransaction({
      collection: PLAYERS_DATABASE_COLLECTIONS.leagues,
      feature: FEATURE,
      action: 'mergeLeagueTeamIndexFromDoc',
      readsCount: 2,
      writesCount: 1,
      readPayload: usagePayload.readPayload,
      writePayload: usagePayload.writePayload,
      meta: {
        targetLeagueId: targetId,
        sourceLeagueId: sourceId,
        added: result.added,
      },
    })
  }

  return result
}

export async function getLatestLeagueSnapshot(leagueId, seasonId = '') {
  const id = clean(leagueId)
  if (!id) return null

  const snap = await getDocs(query(snapsRef(), where('leagueId', '==', id)))
  const rows = snap.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .filter((item) => !seasonId || item.seasonId === seasonId)
    .sort((a, b) => {
      const aKey = clean(a.capturedAt) || clean(a.createdAt?.toDate?.()?.toISOString?.())
      const bKey = clean(b.capturedAt) || clean(b.createdAt?.toDate?.()?.toISOString?.())
      return bKey.localeCompare(aKey)
    })

  trackFirestoreRead({
    collection: PLAYERS_DATABASE_COLLECTIONS.leagueSnapshots,
    feature: FEATURE,
    action: 'getLatestLeagueSnapshot',
    docs: rows,
    docsCount: snap.docs.length,
    meta: {
      leagueId: id,
      seasonId: clean(seasonId),
    },
  })

  return rows[0] || null
}

export async function updateLeagueSnapshotTeamSlot({
  snapshotId,
  rowId,
  teamSlot,
  context = {},
} = {}) {
  const id = clean(snapshotId)
  const safeRowId = clean(rowId)

  if (!id || !safeRowId) {
    throw new Error('missing snapshot row identity')
  }

  let usagePayload = null

  const result = await runTransaction(db, async (tx) => {
    const ref = snapRef(id)
    const snap = await tx.get(ref)

    if (!snap.exists()) {
      throw new Error('snapshot not found')
    }

    const current = {
      id: snap.id,
      ...snap.data(),
    }
    const leagueId = clean(context.leagueId || current.leagueId)
    const leagueSnap = leagueId ? await tx.get(leagueRef(leagueId)) : null
    const league = leagueSnap?.exists?.() ? leagueSnap.data() : {}
    const teamIndex = league.teamsIndex || {}
    let movedTeamIndex = null
    const rows = Array.isArray(current.rows) ? current.rows : []
    const nextRows = rows.map((row) => {
      if (clean(row.rowId) !== safeRowId) return row

      const oldTeamSeasonKey = clean(row.teamSeasonKey)

      const identity = buildTeamIdentity({
        clubId: row.clubId,
        clubName: row.clubName,
        seasonId: current.seasonId || context.seasonId,
        ageGroupId: current.ageGroupId || context.ageGroupId,
        ageGroupLabel: current.ageGroupLabel || context.ageGroupLabel,
        teamSlot,
        leagueId: context.leagueId || current.leagueId,
        leagueName: current.leagueName || context.leagueName,
      })
      const oldSummary = oldTeamSeasonKey
        ? teamIndex[oldTeamSeasonKey]
        : null

      if (
        oldSummary &&
        identity.teamSeasonKey &&
        oldTeamSeasonKey !== identity.teamSeasonKey
      ) {
        movedTeamIndex = {
          from: oldTeamSeasonKey,
          to: identity.teamSeasonKey,
          summary: {
            ...oldSummary,
            clubId: identity.clubId,
            clubName: identity.clubName,
            seasonId: identity.seasonId,
            ageGroupId: identity.ageGroupId,
            teamSlot: identity.teamSlot,
            teamSlotId: identity.teamSlotId,
            teamSeasonKey: identity.teamSeasonKey,
            leagueId: identity.leagueId,
            updatedAt: new Date().toISOString(),
          },
        }
      }

      return {
        ...row,
        teamSlot: identity.teamSlot,
        teamSlotId: identity.teamSlotId,
        teamSeasonKey: identity.teamSeasonKey,
      }
    })

    tx.set(ref, {
      rows: nextRows,
      updatedAt: serverTimestamp(),
    }, { merge: true })

    if (leagueId && movedTeamIndex) {
      tx.update(leagueRef(leagueId), {
        [`teamsIndex.${movedTeamIndex.from}`]: deleteField(),
        [`teamsIndex.${movedTeamIndex.to}`]: movedTeamIndex.summary,
        updatedAt: serverTimestamp(),
      })
    }

    usagePayload = {
      readPayload: current,
      writePayload: {
        snapshotId: id,
        rowId: safeRowId,
        teamSlot,
        movedTeamIndex,
      },
    }

    return {
      snapshotId: id,
      rowId: safeRowId,
    }
  })

  if (usagePayload) {
    trackFirestoreTransaction({
      collection: PLAYERS_DATABASE_COLLECTIONS.leagueSnapshots,
      feature: FEATURE,
      action: 'updateLeagueSnapshotTeamSlot',
      readsCount: 1,
      writesCount: 1,
      readPayload: usagePayload.readPayload,
      writePayload: usagePayload.writePayload,
      meta: result,
    })
  }

  return result
}
