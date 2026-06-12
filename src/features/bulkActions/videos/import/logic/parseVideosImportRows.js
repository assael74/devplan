// features/bulkActions/videos/import/logic/parseVideosImportRows.js

const clean = value => String(value ?? '').trim()

function splitLine(line) {
  if (line.includes('\t')) return line.split('\t')
  if (line.includes(',')) return line.split(',')

  return [line]
}

export function parseVideosImportRows(text = '') {
  return String(text || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const cols = splitLine(line)

      return {
        rowId: `video-import-row-${index + 1}`,
        rowNumber: index + 1,
        name: clean(cols[0]),
        link: clean(cols[1]),
      }
    })
    .filter(row => row.name || row.link)
}
