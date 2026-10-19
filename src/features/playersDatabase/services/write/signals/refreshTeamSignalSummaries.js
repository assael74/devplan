// src/features/playersDatabase/services/write/signals/refreshTeamSignalSummaries.js

import { collection, doc, FieldPath, query, where } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedGetDocsFromServer, trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { estimatePayloadBytes } from '../../../../../services/firestore/usage/firestoreUsage.size.js'
import { PLAYERS_DATABASE_COLLECTIONS as collections } from '../../../constants/pdb.constants.js'
import { buildClubTeamSignalStates } from '../../../model/team/signals/teamSignalSources.model.js'
import { invalidateDocumentCacheByPrefixKeepingSnapshot } from '../../cache/index.js'
import { LEAGUES_CENTER_DOCUMENT } from '../../../catalog/firestoreDocuments/leaguesCenter.catalog.js'

const usage = { feature: 'playersDatabase', action: 'team-signal-summary-refresh' }
const clean = value => String(value || '').trim()

export const collectSignalClubIds = input => {
  const ids = new Set()
  const visited = new WeakSet()
  const visit = value => {
    if (!value || typeof value !== 'object' || visited.has(value)) return
    visited.add(value)
    Object.entries(value).forEach(([key, child]) => {
      if (['clubId', 'fromClubId', 'toClubId'].includes(key) && typeof child === 'string' && clean(child)) ids.add(clean(child))
      else if (!['notes', 'ref'].includes(key)) visit(child)
    })
  }
  visit(input)
  return [...ids]
}

const refreshClub = async ({ clubId, leagueSnapshots, computedAt, scope }) => {
  const teamSnapshots = await trackedGetDocsFromServer(query(
    collection(db, collections.teamSeasons), where('identity.clubId', '==', clubId),
  ), usage)
  const teamRefs = teamSnapshots.docs.map(snapshot => snapshot.ref)
  const leagues = leagueSnapshots.filter(snapshot => {
    const league = snapshot.data()
    return Object.values(league.seasonsById || {}).some(season => (
      Object.values(season.table?.teamsById || {}).some(team => team.clubId === clubId)
    )) || teamSnapshots.docs.some(team => team.data().identity?.leagueId === snapshot.id)
  })
  const seasonIds = new Set(teamSnapshots.docs.map(snapshot => snapshot.data().identity?.seasonId).filter(Boolean))
  leagues.forEach(snapshot => Object.entries(snapshot.data().seasonsById || {}).forEach(([seasonId, season]) => {
    if (Object.values(season.table?.teamsById || {}).some(team => team.clubId === clubId)) seasonIds.add(seasonId)
  }))
  const profileIds = new Set([clubId])
  teamSnapshots.docs.forEach(snapshot => {
    const movement = snapshot.data().movement || {}
    ;[...Object.values(movement.transfersInById || {}), ...Object.values(movement.transfersOutById || {})]
      .forEach(fact => [fact.fromClubId, fact.toClubId].filter(Boolean).forEach(id => profileIds.add(id)))
  })
  const profileRefs = [...profileIds].map(id => doc(db, collections.clubProfiles, id))
  const centerRefs = (scope ? [scope.seasonId] : [...seasonIds]).map(id => doc(db, collections.clubsCenter, id))
  const leaguesCenterRef = doc(db, collections.leaguesCenter, 'all')
  const refs = [...leagues.map(snapshot => snapshot.ref), ...teamRefs, ...profileRefs, ...centerRefs, leaguesCenterRef]

  return trackedRunTransaction(db, async transaction => {
    const snapshots = new Map()
    for (const ref of refs) snapshots.set(ref.path, await transaction.get(ref))
    const read = ref => {
      const snapshot = snapshots.get(ref.path)
      return snapshot?.exists() ? { id: ref.id || ref.path.split('/').pop(), ...snapshot.data() } : null
    }
    const profilesById = Object.fromEntries(profileRefs.map(ref => [ref.id || ref.path.split('/').pop(), read(ref)]))
    const states = buildClubTeamSignalStates({
      clubId, profilesById, computedAt, scope,
      leagues: leagues.map(snapshot => read(snapshot.ref)).filter(Boolean),
      teamSeasons: teamRefs.map(read).filter(Boolean),
    })
    const updates = new Map()
    const put = (ref, parts, summary, previous) => {
      if (JSON.stringify(previous) === JSON.stringify(summary)) return
      if (!updates.has(ref.path)) updates.set(ref.path, { ref, fields: [], patches: [] })
      updates.get(ref.path).fields.push(new FieldPath(...parts), summary)
      updates.get(ref.path).patches.push({ parts, summary })
    }
    const leaguesCenter = read(leaguesCenterRef)
    states.forEach(target => {
      const summary = target.state.summary
      const teamRef = target.teamSeasonDocumentId ? doc(db, collections.teamSeasons, target.teamSeasonDocumentId) : null
      const team = teamRef ? read(teamRef) : null
      if (team) put(teamRef, ['teamSignalSummary'], summary, team.teamSignalSummary)
      const leagueRef = target.leagueId ? doc(db, collections.leagues, target.leagueId) : null
      const league = leagueRef ? read(leagueRef) : null
      const row = league?.seasonsById?.[target.seasonId]?.table?.teamsById?.[target.teamId]
      if (row) put(leagueRef, ['seasonsById', target.seasonId, 'table', 'teamsById', target.teamId, 'teamSignalSummary'],
        summary, row.teamSignalSummary)
      const centerTeam = leaguesCenter?.leaguesById?.[target.leagueId]?.seasonsById?.[target.seasonId]?.teamsById?.[target.teamId]
      if (centerTeam) put(leaguesCenterRef,
        ['leaguesById', target.leagueId, 'seasonsById', target.seasonId, 'teamsById', target.teamId, 'teamSignalSummary'],
        summary, centerTeam.teamSignalSummary)
      const clubRef = doc(db, collections.clubsCenter, target.seasonId)
      const clubTeam = read(clubRef)?.clubsById?.[clubId]?.teamsById?.[target.teamId]
      if (clubTeam) put(clubRef, ['clubsById', clubId, 'teamsById', target.teamId, 'teamSignalSummary'], summary, clubTeam.teamSignalSummary)
    })
    const centerUpdate = updates.get(leaguesCenterRef.path)
    if (centerUpdate) {
      const projected = JSON.parse(JSON.stringify(leaguesCenter))
      centerUpdate.patches.forEach(({ parts, summary }) => {
        let cursor = projected
        parts.slice(0, -1).forEach(part => { cursor = cursor[part] })
        cursor[parts[parts.length - 1]] = summary
      })
      if (estimatePayloadBytes(projected) > LEAGUES_CENTER_DOCUMENT.sizePolicy.blockWriteBytes) {
        throw new Error('סיכום האיתותים חורג ממגבלת גודל מרכז הליגות; לא נשמרו ההקרנות')
      }
    }
    if (updates.size > 450) throw new Error('יותר מדי מסמכים לרענון איתותי מועדון בפעולה אחת')
    updates.forEach(({ ref, fields }) => transaction.update(ref, ...fields))
    return { teams: states.length, documents: updates.size }
  }, usage)
}

export const refreshTeamSignalSummaries = async ({ clubIds = [], source = null, scope = null } = {}) => {
  if (scope && (!clean(scope.seasonId) || !Number.isInteger(scope.birthYear) || scope.birthYear <= 0)) {
    throw new Error('תחום רענון האיתותים חייב לכלול עונה ושנתון תקינים')
  }
  const ids = [...new Set([...clubIds, ...collectSignalClubIds(source)].map(clean).filter(Boolean))]
  if (!ids.length) return { teams: 0, documents: 0 }
  const leagues = await trackedGetDocsFromServer(collection(db, collections.leagues), usage)
  const result = { teams: 0, documents: 0 }
  const computedAt = new Date().toISOString()
  try {
    for (const clubId of ids) {
      const refreshed = await refreshClub({ clubId, leagueSnapshots: leagues.docs, computedAt, scope })
      result.teams += refreshed.teams
      result.documents += refreshed.documents
    }
  } finally {
    ;['team', 'league', 'leaguesCenter', 'clubsCenter'].forEach(invalidateDocumentCacheByPrefixKeepingSnapshot)
  }
  return result
}
