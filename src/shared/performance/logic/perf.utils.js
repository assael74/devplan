// src/shared/performance/logic/perf.utils.js
export function toNumOrNull(v) {
  var n = Number(v);
  return isFinite(n) ? n : null
}

export function toNum0(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0
}

export function endsWith(str, suffix) {
  var s = String(str || '');
  var suf = String(suffix || '');
  if (!suf) return false;
  return s.slice(-suf.length) === suf
}

export function safeString(v) {
  return v == null ? '' : String(v)
}

export function getOrder(x, fallback) {
  if (!x) return fallback;
  return x.order != null ? x.order : fallback
}

export function shallowClone(obj) {
  var out = {}; if (!obj) return out;
  var ks = Object.keys(obj);
  for (var i = 0; i < ks.length; i++) out[ks[i]] = obj[ks[i]];
  return out
}
