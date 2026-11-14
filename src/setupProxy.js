// src/setupProxy.js
const { collectProjectDocuments } = require('../scripts/prepare-project-documents.cjs')

const loopback = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i

module.exports = app => {
  app.get('/__devplan/dev/project-documents', (request, response) => {
    const host = request.get('host')
    const origin = request.get('origin')
    const isLocal = loopback.has(request.socket.remoteAddress) && localHost.test(host)
    const sameOrigin = !origin || origin === `${request.protocol}://${host}`
    if (!isLocal || !sameOrigin || request.get('x-devplan-local-docs') !== '1') return response.sendStatus(404)

    response.set('Cache-Control', 'no-store')
    try {
      const { readProjectDocuments } = require('../functions/src/http/projectDocuments/projectDocuments.http.js')
      const documents = collectProjectDocuments({ includeUntracked: true })
      return response.json(readProjectDocuments(documents, request.query.documentId))
    } catch (error) {
      if (error.code === 'not-found') return response.sendStatus(404)
      if (error.code === 'invalid-argument') return response.sendStatus(400)
      console.error('Could not load project documents', error)
      return response.sendStatus(500)
    }
  })
}
