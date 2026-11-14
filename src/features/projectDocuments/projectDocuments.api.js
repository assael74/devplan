// src/features/projectDocuments/projectDocuments.api.js
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../../services/firebase/firebase.js'

export async function readProjectDocuments(documentId) {
  const input = documentId === undefined ? {} : { documentId }
  const onLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)

  if (process.env.NODE_ENV === 'development' && onLocalhost) {
    const query = documentId === undefined ? '' : '?' + new URLSearchParams(input)
    const response = await fetch('/__devplan/dev/project-documents' + query, {
      headers: { 'X-DevPlan-Local-Docs': '1' },
    })

    if (response.status === 404) {
      throw Object.assign(new Error('המסמך לא נמצא'), { code: 'functions/not-found' })
    }
    if (!response.ok) throw new Error('טעינת התיעוד המקומי נכשלה')
    return response.json()
  }

  const read = httpsCallable(getFunctions(app, 'europe-west1'), 'readProjectDocuments')
  return (await read(input)).data
}
