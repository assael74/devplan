// src/shared/liveTagging/pitch/pitchZones.helpers.js

import {
  PITCH_ZONES_18,
  PITCH_ZONES_18_BY_NUMBER,
} from './pitchZones18.constants.js'

export const getPitchZoneByNumber = (zoneNumber) => {
  if (!zoneNumber) return null
  return PITCH_ZONES_18_BY_NUMBER[Number(zoneNumber)] || null
}

export const getPitchZoneLabel = (zoneNumber) => {
  const zone = getPitchZoneByNumber(zoneNumber)
  return zone?.label || '-'
}

export const isValidPitchZoneNumber = (zoneNumber) => {
  return Boolean(getPitchZoneByNumber(zoneNumber))
}

export const getPitchZonesByLengthBand = (lengthBand) => {
  if (!lengthBand) return []
  return PITCH_ZONES_18.filter((zone) => zone.lengthBand === lengthBand)
}

export const buildEventFieldFromZone = (zoneNumber) => {
  const zone = getPitchZoneByNumber(zoneNumber)

  if (!zone) {
    return {
      layoutId: null,
      zoneId: null,
      zoneNumber: null,
    }
  }

  return {
    layoutId: zone.layoutId,
    zoneId: zone.id,
    zoneNumber: zone.number,
  }
}
