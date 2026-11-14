// src/features/projectDocuments/useProjectDocument.js
import { useEffect, useState } from 'react'
import { readProjectDocuments } from './projectDocuments.api.js'

export function useProjectDocument(documentId) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (documentId === null) return undefined
    let active = true

    readProjectDocuments(documentId).then(data => {
      if (active) setResult({ documentId, attempt, data })
    }, error => {
      if (active) setResult({ documentId, attempt, error })
    })

    return () => { active = false }
  }, [attempt, documentId])

  const current = result?.documentId === documentId && result?.attempt === attempt ? result : null

  return {
    data: current?.data,
    error: current?.error,
    loading: documentId !== null && !current,
    retry: () => setAttempt(value => value + 1),
  }
}
