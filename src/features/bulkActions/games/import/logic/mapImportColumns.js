// src/features/bulkActions/games/import/logic/mapImportColumns.js

const clean = value => String(value ?? '').trim()

const normalizeKey = value => {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[_-]/g, '')
}

const buildAliasMap = columns => {
  return Object.entries(columns || {}).reduce((acc, [fieldKey, aliases]) => {
    aliases.forEach(alias => {
      acc[normalizeKey(alias)] = fieldKey
    })

    return acc
  }, {})
}

export function mapImportColumns(headers = [], config = {}) {
  const aliasMap = buildAliasMap(config.columns)
  const mapped = {}
  const unknownHeaders = []

  headers.forEach((header, index) => {
    const normalized = normalizeKey(header)
    const fieldKey = aliasMap[normalized]

    if (fieldKey) {
      mapped[fieldKey] = index
      return
    }

    unknownHeaders.push({
      header,
      index,
    })
  })

  const missingRequired = (config.required || []).filter(
    fieldKey => mapped[fieldKey] === undefined
  )

  return {
    mapped,
    unknownHeaders,
    missingRequired,
    ok: missingRequired.length === 0,
  }
}

export function buildMappedRows({ headers = [], rows = [], config = {} }) {
  const columnsMap = mapImportColumns(headers, config)

  const mappedRows = rows.map((row, rowIndex) => {
    const raw = headers.reduce((acc, header, index) => {
      acc[header] = row[index] ?? ''
      return acc
    }, {})

    const mapped = Object.entries(columnsMap.mapped).reduce(
      (acc, [fieldKey, index]) => {
        acc[fieldKey] = row[index] ?? ''
        return acc
      },
      {}
    )

    return {
      rowIndex,
      displayIndex: rowIndex + 1,
      raw,
      mapped,
    }
  })

  return {
    ...columnsMap,
    rows: mappedRows,
  }
}
