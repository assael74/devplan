// C:\projects\devplan\functions\src\services\narrative\loadInput.js

const { readPlayer } = require('../../repositories/narrative/player.repo')
const { readTeams } = require('../../repositories/narrative/team.repo')
const { readLatestTeamProjection } = require('../../repositories/narrative/searchIndex.repo')
const { buildInput } = require('../../domain/narrative/input')

function clean(value) {
  return String(value || '').trim()
}

function resolveTeamIds(player = {}) {
  const entries = [
    ...(Array.isArray(player.history) ? player.history : []),
    ...(Array.isArray(player.current) ? player.current : []),
  ]

  return [...new Set(
    entries
      .map(entry => clean(entry.birthTeamDocumentId))
      .filter(Boolean)
  )]
}

function hasScoutProfiles(player = {}) {
  const entries = [
    ...(Array.isArray(player.history) ? player.history : []),
    ...(Array.isArray(player.current) ? player.current : []),
  ]

  return entries.some(entry => (
    Array.isArray(entry.scoutProfiles) && entry.scoutProfiles.length > 0
  ))
}

async function loadInput(playerId) {
  const player = await readPlayer(playerId)

  if (!player) {
    throw Object.assign(new Error('player not found'), { status: 404 })
  }

  if (!hasScoutProfiles(player)) {
    throw Object.assign(new Error('player is not scout relevant'), { status: 409 })
  }

  const [teams, futureProjection] = await Promise.all([
    readTeams(resolveTeamIds(player)),
    readLatestTeamProjection(player),
  ])

  return buildInput({ player, teams, futureProjection })
}

module.exports = { loadInput }
