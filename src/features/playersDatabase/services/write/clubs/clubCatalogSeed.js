import * as XLSX from 'xlsx'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../../catalog/clubs.catalog.js'
import { cleanValue } from '../../../model/shared/value.model.js'
import { syncClubsMasterDocument } from './clubsMaster.js'
import { upsertClubDocument } from './clubDoc.js'

const clean = cleanValue
const normalizeName = value => clean(value)
  .normalize('NFKC')
  .toLocaleLowerCase('he')
  .replace(/[^\p{L}\p{N}]/gu, '')

const extractExternalClubId = url => {
  try {
    return clean(new URL(url).searchParams.get('club_id'))
  } catch {
    return ''
  }
}

const readCell = cell => clean(cell?.l?.Target || cell?.v)

const readClubLinkRows = sheet => {
  const range = XLSX.utils.decode_range(sheet?.['!ref'] || 'A1')
  const rows = []

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    rows.push({
      sourceName: readCell(sheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })]),
      clubUrl: readCell(sheet[XLSX.utils.encode_cell({ r: rowIndex, c: 2 })]),
    })
  }

  return rows
}

// Reads the supplied workbook only in the browser, at the explicit seed action.
export const parseClubExternalLinksWorkbook = async file => {
  if (!file) throw new Error('יש לבחור קובץ קישורי מועדונים.')
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
  const linksByName = new Map()

  workbook.SheetNames
    .flatMap(sheetName => readClubLinkRows(workbook.Sheets[sheetName]))
    .forEach(({ sourceName, clubUrl }) => {
      const externalClubId = extractExternalClubId(clubUrl)
      if (!sourceName || !clubUrl || !externalClubId) return
      linksByName.set(normalizeName(sourceName), { sourceName, clubUrl, externalClubId })
    })

  return linksByName
}

const resolveCatalogClubExternalLink = ({ club = {}, linksByName = new Map() } = {}) => {
  const candidates = [
    club.name,
    club.sourceName,
    club.shortName,
    ...(Array.isArray(club.aliases) ? club.aliases : []),
    ...(Array.isArray(club.searchAliases) ? club.searchAliases : []),
  ]
  return candidates
    .map(normalizeName)
    .filter(Boolean)
    .map(candidate => linksByName.get(candidate))
    .find(Boolean) || null
}

// Creates only base Club projections. Team/season facts are deliberately not
// seeded: the normal Team/League projection flow owns ageGroups and paths.
export async function seedClubCatalogDocuments({ linkWorkbookFile = null } = {}) {
  const linksByName = linkWorkbookFile
    ? await parseClubExternalLinksWorkbook(linkWorkbookFile)
    : new Map()
  const results = []

  for (const club of PLAYERS_DATABASE_CLUBS_CATALOG) {
    const link = resolveCatalogClubExternalLink({ club, linksByName })
    results.push(await upsertClubDocument({
      clubIdentity: {
        clubId: club.id,
        externalClubId: link?.externalClubId || '',
        clubUrl: link?.clubUrl || '',
        name: club.name,
        shortName: club.shortName,
        sourceName: club.sourceName,
        clubLevel: club.clubLevel,
        clubStrengthLevel: club.clubStrengthLevel,
        aliases: club.aliases,
        searchAliases: club.searchAliases,
      },
      lastWriteAction: 'seedClubCatalogDocuments',
    }))
  }

  const master = await syncClubsMasterDocument({
    clubIds: PLAYERS_DATABASE_CLUBS_CATALOG.map(club => club.id),
    lastWriteAction: 'seedClubCatalogDocuments',
  })

  return {
    completed: true,
    clubsCount: results.length,
    workbookLinksCount: linksByName.size,
    createdCount: results.filter(result => result.created).length,
    updatedCount: results.filter(result => result.updated && !result.created).length,
    unchangedCount: results.filter(result => result.writeSkipped).length,
    linkedCount: results.filter((result, index) => (
      Boolean(resolveCatalogClubExternalLink({
        club: PLAYERS_DATABASE_CLUBS_CATALOG[index],
        linksByName,
      }))
    )).length,
    master,
  }
}
