// src/features/bulkActions/players/import/logic/playersImportDuplicates.js

function cleanNamePart(value) {
  return String(value == null ? '' : value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/["'׳״`]/g, '')
    .toLocaleLowerCase('he')
}

function splitNameParts(value) {
  return cleanNamePart(value).split(/\s+/).filter(Boolean)
}

function splitFullName(value) {
  const parts = splitNameParts(value)

  if (!parts.length) {
    return {
      firstName: '',
      lastName: '',
      lastNameParts: [],
    }
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: '',
      lastNameParts: [],
    }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
    lastNameParts: parts.slice(1),
  }
}

function resolvePlayerNames(player = {}) {
  const nestedPlayer = player.player || {}

  const firstName = cleanNamePart(
    player.playerFirstName ||
    player.firstName ||
    nestedPlayer.playerFirstName ||
    nestedPlayer.firstName
  )

  const lastName = cleanNamePart(
    player.playerLastName ||
    player.lastName ||
    nestedPlayer.playerLastName ||
    nestedPlayer.lastName
  )

  if (firstName || lastName) {
    return {
      firstName,
      lastName,
      lastNameParts: splitNameParts(lastName),
    }
  }

  return splitFullName(
    player.playerFullName ||
    player.fullName ||
    player.playerName ||
    nestedPlayer.playerFullName ||
    nestedPlayer.fullName ||
    nestedPlayer.playerName
  )
}

function getLastNameTail(names = {}) {
  const parts = Array.isArray(names.lastNameParts)
    ? names.lastNameParts
    : splitNameParts(names.lastName)

  return parts[parts.length - 1] || ''
}

export function isSamePlayerName(firstPlayer = {}, secondPlayer = {}) {
  const first = resolvePlayerNames(firstPlayer)
  const second = resolvePlayerNames(secondPlayer)

  if (!first.firstName || !second.firstName) return false
  if (first.firstName !== second.firstName) return false

  if (first.lastName && first.lastName === second.lastName) {
    return true
  }

  const firstTail = getLastNameTail(first)
  const secondTail = getLastNameTail(second)

  return Boolean(
    firstTail &&
    secondTail &&
    firstTail === secondTail
  )
}

function addDuplicateWarning(row, message) {
  return {
    ...row,
    alreadyExists: true,
    valid: false,
    status: 'existing',
    warnings: [
      ...(Array.isArray(row.warnings) ? row.warnings : []),
      {
        field: 'playerName',
        message,
      },
    ],
  }
}

export function markExistingPlayers(importRows = [], existingPlayers = []) {
  const processedImportPlayers = []

  return importRows.map(row => {
    const existsInSystem = existingPlayers.some(existingPlayer => {
      return isSamePlayerName(row.data, existingPlayer)
    })

    if (existsInSystem) {
      return addDuplicateWarning(
        row,
        'השחקן כבר קיים בקבוצה ולא ייובא'
      )
    }

    const duplicatedInImport = processedImportPlayers.some(importPlayer => {
      return isSamePlayerName(row.data, importPlayer)
    })

    if (duplicatedInImport) {
      return addDuplicateWarning(
        row,
        'השחקן מופיע יותר מפעם אחת בטבלה ולא ייובא שוב'
      )
    }

    processedImportPlayers.push(row.data)

    return {
      ...row,
      alreadyExists: false,
    }
  })
}

export function removeExistingPlayers(rows = []) {
  return rows.filter(row => row.valid && !row.alreadyExists)
}
