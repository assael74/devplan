// src/features/playersDatabase/services/write/team/saveTeamNotes.js

import { doc, FieldPath } from 'firebase/firestore'
import { db } from '../../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import { buildTeamNotesSavePatch, TEAM_NOTE_SECTION_IDS } from '../../../model/team/teamNotes.model.js'
import {
  buildClubsCenterCacheKey,
  buildLeagueDocumentCacheKey,
  buildTeamDocumentCacheKey,
  invalidateDocumentCacheValueKeepingSnapshot,
} from '../../cache/index.js'

const usage = { feature: 'playersDatabase', action: 'team-notes-save' }
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}

const projectionTargets = ({ root, teamId, centerData, centerRef }) => {
  const targets = new Map()
  const locations = new Map()
  Object.entries(object(root.seasonRefsById)).forEach(([seasonId, seasonRef]) => {
    const leagueId = String(seasonRef.leagueId || '').trim()
    if (leagueId) locations.set(`${leagueId}/${seasonId}`, { leagueId, seasonId })
  })
  Object.entries(object(centerData.leaguesById)).forEach(([leagueId, league]) => {
    Object.entries(object(league.seasonsById)).forEach(([seasonId, season]) => {
      if (object(season.teamsById)[teamId]) {
        locations.set(`${leagueId}/${seasonId}`, { leagueId, seasonId })
      }
    })
  })
  locations.forEach(({ leagueId, seasonId }) => {
    const leagueRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.leagues, leagueId)
    const clubRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.clubsCenter, seasonId)
    const clubId = String(root.identity.clubId || '').trim()
    const add = (ref, path, exists) => {
      const target = targets.get(ref.path) || { ref, fields: [] }
      target.fields.push({ path, exists })
      targets.set(ref.path, target)
    }
    add(leagueRef,
      new FieldPath('seasonsById', seasonId, 'table', 'teamsById', teamId, 'showInvestigationIndicator'),
      data => Boolean(data.seasonsById?.[seasonId]?.table?.teamsById?.[teamId]))
    add(centerRef,
      new FieldPath('leaguesById', leagueId, 'seasonsById', seasonId, 'teamsById', teamId, 'showInvestigationIndicator'),
      data => Boolean(data.leaguesById?.[leagueId]?.seasonsById?.[seasonId]?.teamsById?.[teamId]))
    add(clubRef,
      new FieldPath('clubsById', clubId, 'teamsById', teamId, 'showInvestigationIndicator'),
      data => Boolean(data.clubsById?.[clubId]?.teamsById?.[teamId]))
  })
  return [...targets.values()]
}

export const saveTeamNotes = async ({
  teamId,
  contentsById,
  dirtyIds,
  showInvestigationIndicator,
}) => {
  const id = String(teamId || '').trim()
  if (!id) throw new Error('מזהה הקבוצה חסר')
  if (!Array.isArray(dirtyIds) || dirtyIds.some(sectionId => !TEAM_NOTE_SECTION_IDS.includes(sectionId))) {
    throw new Error('מסלול מחברת לא תקין')
  }
  if (new Set(dirtyIds).size !== dirtyIds.length || dirtyIds.some(sectionId => !Array.isArray(contentsById?.[sectionId]))) {
    throw new Error('תוכן המחברת לא תקין')
  }
  if (typeof showInvestigationIndicator !== 'boolean') throw new Error('סימון החקירה לא תקין')

  const reference = doc(db, PLAYERS_DATABASE_COLLECTIONS.teamRoots, id)
  const updatedAt = new Date().toISOString()
  const result = await trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(reference)
    if (!snapshot.exists()) throw new Error('כדי לשמור מחברת יש לטעון סגל לראשונה')
    const root = snapshot.data()
    if (root.identity?.teamId !== id) throw new Error('זהות מסמך הקבוצה אינה תואמת')
    const indicatorChanged = (root.notes?.showInvestigationIndicator === true) !== showInvestigationIndicator
    const centerRef = doc(db, PLAYERS_DATABASE_COLLECTIONS.leaguesCenter, 'all')
    const centerSnapshot = indicatorChanged ? await transaction.get(centerRef) : null
    const targets = indicatorChanged ? projectionTargets({
      root,
      teamId: id,
      centerData: centerSnapshot && centerSnapshot.exists() ? centerSnapshot.data() : {},
      centerRef,
    }) : []
    const targetSnapshots = []
    for (const target of targets) {
      targetSnapshots.push({
        target,
        snapshot: target.ref.path === centerRef.path ? centerSnapshot : await transaction.get(target.ref),
      })
    }
    const patch = buildTeamNotesSavePatch({
      currentNotes: root.notes,
      contentsById,
      dirtyIds,
      showInvestigationIndicator,
    })
    if (!Object.keys(patch).length) return { saved: false }
    transaction.update(reference, { ...patch, 'timestamps.updatedAt': updatedAt })
    const projectionPaths = []
    targetSnapshots.forEach(({ target, snapshot: targetSnapshot }) => {
      if (!targetSnapshot.exists()) return
      const data = targetSnapshot.data()
      const fields = target.fields.filter(field => field.exists(data))
      if (!fields.length) return
      transaction.update(target.ref, ...fields.flatMap(field => [field.path, showInvestigationIndicator]))
      projectionPaths.push(target.ref.path)
    })
    return { saved: true, updatedAt, projectionPaths }
  }, usage)
  if (result.saved) {
    invalidateDocumentCacheValueKeepingSnapshot(buildTeamDocumentCacheKey(id))
    result.projectionPaths.forEach(path => {
      const [collectionName, documentId] = path.split('/')
      if (collectionName === PLAYERS_DATABASE_COLLECTIONS.leagues) {
        invalidateDocumentCacheValueKeepingSnapshot(buildLeagueDocumentCacheKey(documentId))
      } else if (collectionName === PLAYERS_DATABASE_COLLECTIONS.leaguesCenter) {
        invalidateDocumentCacheValueKeepingSnapshot('leaguesCenter:all')
      } else if (collectionName === PLAYERS_DATABASE_COLLECTIONS.clubsCenter) {
        invalidateDocumentCacheValueKeepingSnapshot(buildClubsCenterCacheKey(documentId))
      }
    })
  }
  return result
}
