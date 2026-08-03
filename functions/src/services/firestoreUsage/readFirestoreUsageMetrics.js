const { GoogleAuth } = require('google-auth-library')

const METRICS = {
  reads: [
    'firestore.googleapis.com/document/read_ops_count',
    'firestore.googleapis.com/document/read_count',
  ],
  writes: [
    'firestore.googleapis.com/document/write_ops_count',
    'firestore.googleapis.com/document/write_count',
  ],
  deletes: [
    'firestore.googleapis.com/document/delete_ops_count',
    'firestore.googleapis.com/document/delete_count',
  ],
}

const LIMITS = {
  reads: 50000,
  writes: 20000,
  deletes: 20000,
}

function getPacificDayStart(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const values = Object.fromEntries(parts.map(part => [part.type, part.value]))
  const localMidnightGuess = new Date(`${values.year}-${values.month}-${values.day}T00:00:00Z`)

  const offsetParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    timeZoneName: 'longOffset',
    hour: '2-digit',
  }).formatToParts(localMidnightGuess)
  const offsetText = offsetParts.find(part => part.type === 'timeZoneName')?.value || 'GMT-08:00'
  const match = offsetText.match(/GMT([+-])(\d{2}):(\d{2})/)
  const sign = match?.[1] === '-' ? -1 : 1
  const offsetMinutes = match ? sign * (Number(match[2]) * 60 + Number(match[3])) : -480

  return new Date(localMidnightGuess.getTime() - offsetMinutes * 60000)
}

function numberValue(point = {}) {
  const value = point?.value || {}
  if (value.int64Value != null) return Number(value.int64Value) || 0
  if (value.doubleValue != null) return Number(value.doubleValue) || 0
  return 0
}

async function listMetricSeries({ authClient, projectId, metricType, startTime, endTime }) {
  let pageToken = ''
  let total = 0

  do {
    const params = new URLSearchParams({
      filter: `metric.type=\"${metricType}\"`,
      'interval.startTime': startTime,
      'interval.endTime': endTime,
      view: 'FULL',
      pageSize: '1000',
    })
    if (pageToken) params.set('pageToken', pageToken)

    const url = `https://monitoring.googleapis.com/v3/projects/${encodeURIComponent(projectId)}/timeSeries?${params}`
    const response = await authClient.request({ url, method: 'GET' })
    const payload = response.data || {}

    for (const series of payload.timeSeries || []) {
      for (const point of series.points || []) total += numberValue(point)
    }

    pageToken = payload.nextPageToken || ''
  } while (pageToken)

  return total
}

async function readMetricWithFallback(args, candidates) {
  let lastError = null

  for (const metricType of candidates) {
    try {
      const value = await listMetricSeries({ ...args, metricType })
      if (value > 0 || metricType === candidates[candidates.length - 1]) {
        return { value, metricType }
      }
    } catch (error) {
      lastError = error
    }
  }

  if (lastError) throw lastError
  return { value: 0, metricType: candidates[0] }
}

async function readFirestoreUsageMetrics({ projectId }) {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/monitoring.read'],
  })
  const authClient = await auth.getClient()
  const end = new Date()
  const start = getPacificDayStart(end)
  const interval = {
    authClient,
    projectId,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  }

  const [reads, writes, deletes] = await Promise.all([
    readMetricWithFallback(interval, METRICS.reads),
    readMetricWithFallback(interval, METRICS.writes),
    readMetricWithFallback(interval, METRICS.deletes),
  ])

  return {
    reads: reads.value,
    writes: writes.value,
    deletes: deletes.value,
    limits: LIMITS,
    source: 'Google Cloud Monitoring',
    updatedAt: end.toISOString(),
    interval: {
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      timeZone: 'America/Los_Angeles',
    },
    metricTypes: {
      reads: reads.metricType,
      writes: writes.metricType,
      deletes: deletes.metricType,
    },
  }
}

module.exports = {
  readFirestoreUsageMetrics,
}
