// src/shared/performance/logic/perf.cards.logic.js
import { toNum0, endsWith, getOrder } from './perf.utils'
import { isTotalKey, toSuccessKey, toRateKey } from './perf.statsParm'

export function buildPerformanceStatsModel(args) {
  var fullStats = args ? args.fullStats : null
  var statsParm = args ? args.statsParm : null
  var stats = fullStats && typeof fullStats === 'object' ? fullStats : {}
  var minutesLabel = buildMinutesLabel(stats)
  return { top: buildTopStats(stats, minutesLabel), cards: buildCards(stats, statsParm) }
}

function buildMinutesLabel(stats) {
  var played = stats && stats.timePlayed != null ? stats.timePlayed : null
  var total = stats && stats.gameDurationTotal != null ? stats.gameDurationTotal : null
  var pct = stats && stats.playTimeRate != null ? stats.playTimeRate : null
  if (played == null) return null
  if (total == null) return played
  var s = String(played) + ' / ' + String(total)
  if (pct != null) s += ' (' + String(pct) + '%)'
  return s
}

function buildTopStats(stats, minutesLabel) {
  return {
    gamesCount: stats.gamesCount != null ? stats.gamesCount : (stats.totalGames != null ? stats.totalGames : null),
    squadCount: stats.isSelected != null ? stats.isSelected : null,
    startCount: stats.isStarting != null ? stats.isStarting : null,
    minutes: minutesLabel,
    goals: stats.goals != null ? stats.goals : null,
    assists: stats.assists != null ? stats.assists : null,
    normalizeMode: stats.normalizeMode || 'raw',
    canNormalize: stats.canNormalize === true,
    recordedMinutesTotal: stats.recordedMinutesTotal != null ? stats.recordedMinutesTotal : null,
    gameDurationTotal: stats.gameDurationTotal != null ? stats.gameDurationTotal : null,
    gameDurationPerGame: stats.gameDurationPerGame != null ? stats.gameDurationPerGame : null,
    recordedCoveragePct: stats.recordedCoveragePct != null ? stats.recordedCoveragePct : null,
  }
}

function buildNormalizeCaption(stats) {
  if (!stats) return null
  if (String(stats.normalizeMode || 'raw') !== 'normalized') return null
  var perGame = stats.gameDurationPerGame != null ? Number(stats.gameDurationPerGame) : null
  if (isFinite(perGame) && perGame > 0) return 'ל-' + String(Math.round(perGame)) + " דק׳"
  var total = stats.gameDurationTotal != null ? Number(stats.gameDurationTotal) : null
  var games = stats.gamesCount != null ? Number(stats.gamesCount) : null
  if (isFinite(total) && total > 0 && isFinite(games) && games > 0) return 'ל-' + String(Math.round(total / games)) + " דק׳"
  return null
}

function buildCards(stats, statsParm) {
  var arr = Array.isArray(statsParm) ? statsParm : []
  var secondary = []
  var tripletGroups = {}
  var simple = []
  var normCaption = buildNormalizeCaption(stats)

  for (var i = 0; i < arr.length; i++) { var p = arr[i]; if (p && p.id && p.isDefault === false) secondary.push(p) }
  secondary.sort(function (a, b) { return getOrder(a, 999) - getOrder(b, 999) })

  for (var j = 0; j < secondary.length; j++) {
    var p2 = secondary[j]
    var key = p2.id
    var val = stats ? stats[key] : undefined
    if (val === undefined) continue
    if (p2.statsParmFieldType === 'triplet') collectTriplet(tripletGroups, p2, key, val)
    else simple.push(buildSimpleCard(p2, key, val, normCaption))
  }

  return buildFinalCards(tripletGroups, simple, normCaption)
}

function collectTriplet(groups, p, key, val) {
  var group = (p && p.tripletGroup) ? p.tripletGroup : 'other'
  var pOrder = getOrder(p, 999)
  if (!groups[group]) groups[group] = { total: null, success: null, rate: null, label: group, order: pOrder }
  if (endsWith(key, 'Total')) { groups[group].label = p.statsParmShortName || p.statsParmName || group; groups[group].total = val }
  else if (endsWith(key, 'Success')) groups[group].success = val
  else if (endsWith(key, 'SuccessRate')) groups[group].rate = val
  groups[group].order = Math.min(groups[group].order != null ? groups[group].order : 999, pOrder)
}

function buildSimpleCard(p, key, val, normCaption) {
  var baseLabel = p.statsParmShortName || p.statsParmName || key
  var label = normCaption ? (baseLabel + ' ' + normCaption) : baseLabel
  return { key: key, label: label, iconId: key, value: val, order: getOrder(p, 999), _kind: 'simple' }
}

function buildFinalCards(tripletGroups, simple, normCaption) {
  var triplets = []
  for (var group in tripletGroups) {
    if (!Object.prototype.hasOwnProperty.call(tripletGroups, group)) continue
    var card = buildTripletCard(group, tripletGroups[group], normCaption)
    if (card) triplets.push(card)
  }
  var all = triplets.concat(simple)
  all.sort(function (a, b) { return getOrder(a, 999) - getOrder(b, 999) })
  return all
}

function buildTripletCard(group, x, normCaption) {
  var total = Number(x && x.total)
  if (!isFinite(total) || total <= 0) return null
  var success = Number(x && x.success)
  var hasSuccess = isFinite(success)
  var rate = null
  if (x && x.rate != null) rate = Number(x.rate)
  else if (hasSuccess) rate = Math.round((success / total) * 100)
  var baseLabel = (x && x.label) || group
  var label = normCaption ? (baseLabel + ' ' + normCaption) : baseLabel
  return {
    key: group,
    iconId: group,
    label: label,
    value: String(hasSuccess ? success : 0) + ' / ' + String(total),
    sub: rate != null ? '(' + String(rate) + '%)' : '',
    order: x && x.order != null ? x.order : 999,
    _kind: 'triplet'
   }
}
