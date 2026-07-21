// features/playersDatabase/services/write/searchIndex/shared/searchIndexBatch.write.js

export const commitBatchWhenNeeded = async ({ batch, operationsCount = 0 } = {}) => {
  const safeCount = Number.isFinite(Number(operationsCount))
    ? Number(operationsCount)
    : 0

  if (!batch || safeCount <= 0) return false

  await batch.commit()
  return true
}
