// src/shared/performance/logic/perf.statsParm.js
export function getParmKey(p) {
  var k = '';
  if (p) k = p.key || p.statKey || p.id || '';
  return String(k).trim()
}

export function filterStatsParmByType(list, type) {
  var arr = Array.isArray(list) ? list : [];
  var t = type ? String(type) : 'all';
  if (t === 'all') return arr; var out = [];
  for (var i = 0; i < arr.length; i++) { var p = arr[i];
    if (String((p && p.statsParmType) || '') === t) out.push(p)
  }
  return out
}

export function isTotalKey(k) {
  return /Total$/i.test(String(k || ''))
}

export function toSuccessKey(totalKey) {
  return String(totalKey).replace(/Total$/i, 'Success')
}

export function toRateKey(successKey) {
  return String(successKey).replace(/Success$/i, 'SuccessRate')
}

export function buildNormalizedKeys(statsParm) {
  var arr = Array.isArray(statsParm) ? statsParm : [];
  var set = new Set();
  for (var i = 0; i < arr.length; i++) {
    var p = arr[i];
    if (p && p.id && p.isDefault === false) set.add(p.id)
  } return set
}

export function hasAdvancedStatsByParm(stats, statsParm) {
  var arr = Array.isArray(statsParm) ? statsParm : [];
  for (var i = 0; i < arr.length; i++) {
    var p = arr[i]; if (!p || !p.id) continue;
    if (p.isDefault !== false) continue;
    if (stats && stats[p.id] !== undefined) return true
  }
  return false
}
