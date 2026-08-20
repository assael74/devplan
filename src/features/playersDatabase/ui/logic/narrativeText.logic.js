// src/features/playersDatabase/ui/logic/narrativeText.logic.js

export function formatNarrativeTextNumbers(value) {
  return String(value || '').replace(/-?\d+\.\d{2,}/g, match => {
    const number = Number(match)
    if (!Number.isFinite(number)) return match

    const rounded = Math.round(number * 10) / 10
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  })
}
