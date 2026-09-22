// src/features/playersDatabase/services/write/shared/runWithConcurrency.js

const normalizeLimit = value => {
  const limit = Number(value)
  return Number.isInteger(limit) && limit > 0 ? limit : 1
}

export async function runWithConcurrency({
  values = [],
  limit = 4,
  worker = async value => value,
} = {}) {
  const entries = Array.isArray(values) ? values : []
  const results = new Array(entries.length)
  let nextIndex = 0

  const runNext = async () => {
    const index = nextIndex
    nextIndex += 1
    if (index >= entries.length) return

    results[index] = await worker(entries[index], index)
    return runNext()
  }

  await Promise.all(
    Array.from(
      { length: Math.min(normalizeLimit(limit), entries.length) },
      runNext
    )
  )

  return results
}
