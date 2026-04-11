// functions\src\services\notifications\scheduleNotify.js

const { CloudTasksClient } = require('@google-cloud/tasks')

const tasks = new CloudTasksClient()
const REGION = 'europe-west1'
const QUEUE = 'meeting-reminders'

async function scheduleNotify({ when, payload }) {
  const parent = tasks.queuePath(process.env.GCLOUD_PROJECT, REGION, QUEUE)

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: `https://${REGION}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/notifyNow`,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
    scheduleTime: { seconds: Math.floor(when.getTime() / 1000) },
  }

  await tasks.createTask({ parent, task })
}

module.exports = {
  scheduleNotify,
  REGION,
}
