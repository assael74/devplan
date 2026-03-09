// functions/index.js
const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// ---- שליחה מיידית לפי רשימת משתמשים ----
async function getTokensByUserIds(userIds = []) {
  const snaps = await Promise.all(userIds.map(id => db.doc(`users/${id}`).get()));
  return snaps.flatMap(s => (s.exists ? (s.data().fcmTokens || []) : []));
}

async function sendToTokens(tokens, title, body, data = {}) {
  if (!tokens.length) return { sent: 0 };
  const res = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    data
  });
  // ניקוי טוקנים לא תקינים
  const bad = [];
  res.responses.forEach((r, i) => {
    const code = String(r.error?.code || '');
    if (code.includes('registration-token-not-registered')) bad.push(tokens[i]);
  });
  if (bad.length) {
    const all = await db.collection('users').get();
    const batch = db.batch();
    all.forEach(doc => {
      const arr = doc.data().fcmTokens || [];
      const filtered = arr.filter(t => !bad.includes(t));
      if (filtered.length !== arr.length) batch.update(doc.ref, { fcmTokens: filtered });
    });
    await batch.commit();
  }
  return { sent: res.successCount };
}

exports.notifyNow = onRequest({ region: 'europe-west1' }, async (req, res) => {
  try {
    const { userIds = [], title = 'פגישה', body = 'מתחיל בקרוב', data = {} } = req.body || {};
    const tokens = await getTokensByUserIds(userIds);
    const out = await sendToTokens(tokens, title, body, data);
    res.status(200).json(out);
  } catch (e) {
    console.error(e);
    res.status(500).send('error');
  }
});

// ---- תזמון 10 דקות לפני פגישה באמצעות Cloud Tasks ----
const { CloudTasksClient } = require('@google-cloud/tasks');
const tasks = new CloudTasksClient();
const REGION = 'europe-west1';
const QUEUE = 'meeting-reminders';

async function scheduleNotify({ when, payload }) {
  const parent = tasks.queuePath(process.env.GCLOUD_PROJECT, REGION, QUEUE);
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: `https://${REGION}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/notifyNow`,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
    scheduleTime: { seconds: Math.floor(when.getTime() / 1000) }
  };
  await tasks.createTask({ parent, task });
}

exports.onMeetingCreated = onDocumentCreated(
  { region: REGION, document: 'meetings/{meetingId}' },
  async (event) => {
    const m = event.data.data();
    if (!m?.startAt) return;

    const startMs = m.startAt.toMillis ? m.startAt.toMillis() : Date.parse(m.startAt);
    const notifyAt = new Date(Math.max(Date.now() + 60_000, startMs - 10 * 60_000)); // 10 ד׳ לפני

    const userIds = Array.isArray(m.attendees) && m.attendees.length
      ? m.attendees
      : (m.ownerId ? [m.ownerId] : []);

    await scheduleNotify({
      when: notifyAt,
      payload: {
        userIds,
        title: m.title || 'פגישה',
        body: m.whenText || 'מתחיל בעוד מעט',
        data: { meetingId: event.params.meetingId }
      }
    });
  }
);
