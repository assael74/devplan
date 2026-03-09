// src/shared/performance/logic/perf.aggregate.logic.js
import { toNum0, endsWith, shallowClone } from './perf.utils'
import {
  getParmKey,
  filterStatsParmByType,
  isTotalKey,
  toSuccessKey,
  toRateKey,
  buildNormalizedKeys,
  hasAdvancedStatsByParm
} from './perf.statsParm'

export function buildNewFilteredStats(games, statsParm, filters, opts) {
  var g = Array.isArray(games) ? games : []
  var f = filters || {}
  var o = opts || {}
  var statsKey = String(o.statsKey || 'stats')
  var recordedKey = String(o.recordedMinutesKey || 'timeVideoStats')
  var durationKeyInStats = String(o.gameDurationKeyInStats || 'gameDuration')

  var type = f.type != null ? String(f.type) : 'all'
  var statsParmType = f.statsParmType != null ? String(f.statsParmType) : 'all'

  var rows = []
  for (var i = 0; i < g.length; i++) {
    var x = g[i]
    if (type !== 'all') { var gt = String((x && x.type) || (x && x.game && x.game.type) || ''); if (gt !== type) continue }
    var row = mapGameToStatsRow(x, statsKey, recordedKey, durationKeyInStats)
    if (row) rows.push(row)
  }

  var filteredStatsParm = filterStatsParmByType(statsParm, statsParmType)
  var pack = buildNewFullStatsPack(rows, filteredStatsParm)
  
  var filteredStats = []
  for (var j = 0; j < rows.length; j++) filteredStats.push(stripInternalFields(rows[j]))

  return {
    filteredStatsParm: filteredStatsParm,
    filteredStats: filteredStats,
    newFullStatsRaw: pack.raw,
    newFullStatsNorm: pack.norm,
    statsMeta: pack.statsMeta,
    newFullStats: pack.raw
  }
}

export function buildNewFilteredStatsByGroup(games, statsParm, filters, opts) {
  var g = Array.isArray(games) ? games : []
  var o = opts || {}
  var groupKey = String(o.groupKey || 'playerId')

  var buckets = {}
  for (var i = 0; i < g.length; i++) {
    var x = g[i]
    var k = x && x[groupKey]
    if (!k) continue
    if (!buckets[k]) buckets[k] = []
    buckets[k].push(x)
  }

  var out = []
  var keys = Object.keys(buckets)

  for (var j = 0; j < keys.length; j++) {
    var id = keys[j]
    var rows = buckets[id]
    var first = rows[0] || {}

    var statsPack = buildNewFilteredStats(rows, statsParm, filters, o)

    out.push({
      playerId: id,
      playerName: first.playerName || null,
      photo: first.photo || null,
      positions: first.positions || [],
      ...statsPack,
    })
  }

  return out
}

function mapGameToStatsRow(g, statsKey, recordedKey, durationKeyInStats) {
  var stats = (g && g[statsKey]) || null
  if (!stats) return null

  var gameDuration = stats && stats[durationKeyInStats] != null ? stats[durationKeyInStats] : null
  var recordedMinutes = stats && stats[recordedKey] != null ? stats[recordedKey] : null

  var out = shallowClone(stats)
  out.__gameDuration = gameDuration
  out.__recordedMinutes = recordedMinutes
  return out
}

function stripInternalFields(row) {
  var out = {}
  if (!row) return out
  var ks = Object.keys(row)
  for (var i = 0; i < ks.length; i++) { var k = ks[i]; if (k === '__gameDuration' || k === '__recordedMinutes') continue; out[k] = row[k] }
  return out
}

function buildNewFullStatsPack(rows, statsParm) {
  var r = Array.isArray(rows) ? rows : []
  var p = Array.isArray(statsParm) ? statsParm : []
  var normalizedKeys = buildNormalizedKeys(p)

  var keys = new Set()
  for (var i = 0; i < p.length; i++) { var k = getParmKey(p[i]); if (k) keys.add(k) }

  var raw = { gamesCount: r.length, normalizeMode: 'raw' }
  keys.forEach(function (k2) { raw[k2] = 0 })

  var gameDurationTotal = 0
  var recordedMinutesTotal = 0
  var timePlayedSum = 0

  for (var j = 0; j < r.length; j++) {
    var row = r[j]
    if (!row) continue
    keys.forEach(function (kk) { raw[kk] = toNum0(raw[kk]) + toNum0(row[kk]) })
    gameDurationTotal += toNum0(row.__gameDuration)
    recordedMinutesTotal += toNum0(row.__recordedMinutes)
    timePlayedSum += toNum0(row.timePlayed)
  }

  if (raw.timePlayed === undefined && timePlayedSum) raw.timePlayed = timePlayedSum

  raw.gameDurationTotal = gameDurationTotal > 0 ? gameDurationTotal : null
  raw.gameDurationPerGame = (r.length > 0 && gameDurationTotal > 0) ? Math.round(gameDurationTotal / r.length) : null
  raw.recordedMinutesTotal = recordedMinutesTotal > 0 ? recordedMinutesTotal : null
  raw.recordedCoveragePct = gameDurationTotal > 0 ? Math.round((recordedMinutesTotal / gameDurationTotal) * 100) : null
  raw.playTimeRate = gameDurationTotal > 0 ? Math.round((toNum0(raw.timePlayed) / gameDurationTotal) * 100) : null
  raw.hasAdvancedStats = hasAdvancedStatsByParm(raw, p)

  keys.forEach(function (k3) {
    if (!isTotalKey(k3)) return
    var total = toNum0(raw[k3])
    if (total <= 0) return
    var successKey = toSuccessKey(k3)
    if (!keys.has(successKey)) return
    raw[toRateKey(successKey)] = Math.round((toNum0(raw[successKey]) / total) * 100)
  })

  var canNormalize = !!(raw.hasAdvancedStats && recordedMinutesTotal > 0 && raw.gameDurationPerGame > 0)
  var norm = shallowClone(raw)
  norm.normalizeMode = canNormalize ? 'normalized' : 'raw'
  norm.canNormalize = canNormalize
  if (canNormalize) applyNormalization(norm, keys, normalizedKeys, recordedMinutesTotal, raw.gameDurationPerGame)

  var statsMeta = {
    gameDurationTotal: raw.gameDurationTotal,
    gameDurationPerGame: raw.gameDurationPerGame,
    recordedMinutesTotal: raw.recordedMinutesTotal,
    recordedCoveragePct: raw.recordedCoveragePct,
    hasAdvancedStats: raw.hasAdvancedStats === true,
    canNormalize: canNormalize,
  }

  return { raw: raw, norm: norm, statsMeta: statsMeta }
}

function applyNormalization(out, keys, normalizedKeys, recordedTotal, gameDurationPerGame) {
  if (!normalizedKeys || recordedTotal <= 0 || !gameDurationPerGame || gameDurationPerGame <= 0) return
  keys.forEach(function (k) {
    if (!normalizedKeys.has(k)) return
    if (k === 'gamesCount' || k === 'timePlayed') return
    if (endsWith(k, 'SuccessRate')) return
    out[k] = Math.round((toNum0(out[k]) / recordedTotal) * gameDurationPerGame)
  })
}
