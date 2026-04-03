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

  const bad = [];
  res.responses.forEach((r, i) => {
    const code = String(r.error?.code || '');
    if (code.includes('registration-token-not-registered')) bad.push(tokens[i]);
  });

  if (bad.length) {
    const all = await db.collection('users').get();
    const batch = db.batch();

    all.forEach(docSnap => {
      const arr = docSnap.data().fcmTokens || [];
      const filtered = arr.filter(t => !bad.includes(t));
      if (filtered.length !== arr.length) batch.update(docSnap.ref, { fcmTokens: filtered });
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
    const notifyAt = new Date(Math.max(Date.now() + 60_000, startMs - 10 * 60_000));

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

// ---- Share / OG helpers ----
function clean(v) {
  return String(v ?? '').trim();
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAppUrl(path = '') {
  const safePath = path.startsWith('/') ? path : `/${path}`
  return `https://devplan-b4454.web.app${safePath}`
}

function extractLastPathPart(req) {
  const parts = String(req.path || '')
    .split('/')
    .map(part => clean(part))
    .filter(Boolean);

  return parts.length ? parts[parts.length - 1] : '';
}

async function getAbilitiesInviteByTokenAdmin(token) {
  const safeToken = clean(token);
  if (!safeToken) return null;

  const snap = await db
    .collection('abilitiesInvites')
    .where('token', '==', safeToken)
    .where('active', '==', true)
    .limit(1)
    .get();

  if (snap.empty) return null;

  const row = snap.docs[0];
  return {
    id: row.id,
    ...row.data(),
  };
}

function buildAbilitiesInviteOgHtml({
  title,
  description,
  image,
  pageUrl,
  redirectUrl,
}) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safePageUrl = escapeHtml(pageUrl);
  const safeRedirectUrl = escapeHtml(redirectUrl);

  return `<!doctype html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${safeTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <meta property="og:locale" content="he_IL" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:url" content="${safePageUrl}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:alt" content="${safeTitle}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />

  <meta http-equiv="refresh" content="0;url=${safeRedirectUrl}" />

  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: Arial, sans-serif; padding: 24px;">
  <div>מעביר לטופס...</div>
  <div style="margin-top:12px; direction:ltr;">${safeRedirectUrl}</div>
</body>
</html>`;
}

exports.shareAbilitiesInvite = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    try {
      const token = extractLastPathPart(req);

      if (!token) {
        return res.status(400).send('missing token');
      }

      const invite = await getAbilitiesInviteByTokenAdmin(token);

      const pageUrl = buildAppUrl(`/share/abilities/${token}`)
      const redirectUrl = buildAppUrl(`/forms/abilities/${token}`)
      const fallbackImage = buildAppUrl('/playerImage.jpg')

      if (!invite) {
        const html = buildAbilitiesInviteOgHtml({
          title: 'טופס הערכת יכולות לשחקן',
          description: 'קישור לטופס הערכת יכולות לשחקן',
          image: fallbackImage,
          pageUrl,
          redirectUrl,
        });

        res.set('Cache-Control', 'public, max-age=60');
        return res.status(200).send(html);
      }

      const playerName = clean(invite?.player?.fullName) || 'שחקן';
      const teamName = clean(invite?.team?.teamName);
      const evaluatorName =
        clean(invite?.evaluator?.fullName) ||
        clean(invite?.evaluator?.type);

      const title = `טופס הערכת יכולות · ${playerName}`;

      const descriptionParts = [];
      if (teamName) descriptionParts.push(`קבוצה: ${teamName}`);
      if (evaluatorName) descriptionParts.push(`מעריך: ${evaluatorName}`);
      descriptionParts.push('מילוי קצר בנייד, ללא צורך בהתחברות.');

      const description = descriptionParts.join(' · ');
      const image = clean(invite?.player?.photo) || fallbackImage;

      const html = buildAbilitiesInviteOgHtml({
        title,
        description,
        image,
        pageUrl,
        redirectUrl,
      });

      res.set('Cache-Control', 'public, max-age=300');
      return res.status(200).send(html);
    } catch (error) {
      console.error('shareAbilitiesInvite failed', error);
      return res.status(500).send('internal error');
    }
  }
);

// ---- Public abilities submit (server-side) ----

const PLAYERS_ABILITIES_COLLECTION = 'playersShorts';
const PLAYERS_ABILITIES_DOC_ID = 'CxI3w6ztc9KfTxJLP8zS';
const ABILITIES_SHORTS_COLLECTION = 'abilitiesShorts';

const abilitiesList = [
  { id: 'speed', label: 'מהירות בסיסית', domain: 'physical', domainLabel: 'פיסי', weight: 1.2 },
  { id: 'agility', label: 'זריזות', domain: 'physical', domainLabel: 'פיסי', weight: 1 },
  { id: 'coordination', label: 'קואורדינציה', domain: 'physical', domainLabel: 'פיסי', weight: 1 },
  { id: 'endurance', label: 'סיבולת', domain: 'physical', domainLabel: 'פיסי', weight: 1.3 },
  { id: 'explosiveness', label: 'כוח מתפרץ', domain: 'physical', domainLabel: 'פיסי', weight: 1.3 },

  { id: 'ballComfort', label: 'נוחות עם כדור', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'firstTouch', label: 'נגיעה ראשונה', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'passingSkill', label: 'טכניקת מסירה', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'dribbleConfidence', label: 'ביטחון בדריבל', domain: 'technical', domainLabel: 'טכני', weight: 1 },
  { id: 'ballStriking', label: 'טכניקת בעיטה', domain: 'technical', domainLabel: 'טכני', weight: 1 },

  { id: 'spatialAwareness', label: 'הבנת מרחבים', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'vision', label: 'ראיית משחק', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'basicPositioning', label: 'הבנת מיקום בסיסית', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },
  { id: 'offBallMovement', label: 'תנועה ללא כדור', domain: 'gameUnderstanding', domainLabel: 'הבנת משחק', weight: 1 },

  { id: 'effort', label: 'השקעה והתמדה', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'coachability', label: 'פתיחות ללמידה', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'emotionalControl', label: 'שליטה רגשית', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'teamPlay', label: 'שיתוף פעולה קבוצתי', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'confidenceLevel', label: 'ביטחון עצמי', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'aggressiveness', label: 'אגרסיביות', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },
  { id: 'communication', label: 'תקשורתיות', domain: 'mental', domainLabel: 'מנטלי', weight: 1 },

  { id: 'decisionSpeed', label: 'מהירות החלטות', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },
  { id: 'learningCurve', label: 'יכולת למידה', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },
  { id: 'adaptability', label: 'גמישות מחשבתית', domain: 'cognitive', domainLabel: 'קוגניטיבי', weight: 1 },

  { id: 'growthStage', label: 'שלב התפתחות ביולוגית', domain: 'development', domainLabel: 'התפתחות', weight: 0 },
];

const WINDOW_DAYS = 56;
const ABILITY_SCORE_MIN = 1;
const ABILITY_SCORE_MAX = 5;

const ABILITY_DOMAIN_WEIGHTS = {
  physical: 0.18,
  technical: 0.22,
  gameUnderstanding: 0.22,
  mental: 0.20,
  cognitive: 0.18,
};

const POTENTIAL_DOMAIN_WEIGHTS = {
  physical: 0.24,
  technical: 0.18,
  gameUnderstanding: 0.20,
  mental: 0.18,
  cognitive: 0.20,
};

const PHYSICAL_GROWTH_ADJUSTMENTS = {
  1: 0.5,
  2: 0.25,
  3: 0,
  4: -0.25,
  5: -0.5,
};

const FINAL_POTENTIAL_GROWTH_ADJUSTMENTS = {
  1: 0.2,
  2: 0.1,
  3: 0,
  4: -0.1,
  5: -0.2,
};

const DOMAIN_RELIABILITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

const OVERALL_RELIABILITY = {
  low: 'low',
  medium: 'medium',
  high: 'high',
};

function toNum(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function round1(num) {
  if (!Number.isFinite(Number(num))) return null;
  return Math.round(Number(num) * 10) / 10;
}

function round2(num) {
  if (!Number.isFinite(Number(num))) return null;
  return Math.round(Number(num) * 100) / 100;
}

function roundToHalf(num) {
  if (!Number.isFinite(Number(num))) return null;
  return Math.round(Number(num) * 2) / 2;
}

function isFilled(v) {
  return v != null && v !== '' && Number.isFinite(Number(v)) && Number(v) > 0;
}

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toIsoDateOnly(input) {
  const raw = clean(input);
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function parseIsoDateOnly(isoDate) {
  const raw = clean(isoDate);
  if (!raw) return null;
  const d = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildAbilitiesFull({ draftAbilities = {} }) {
  const full = {};

  for (const it of abilitiesList) {
    const id = it?.id;
    if (!id) continue;
    full[id] = null;
  }

  for (const [k, v] of Object.entries(draftAbilities || {})) {
    if (!k) continue;
    if (v == null || v === '') full[k] = null;
    else full[k] = Number.isFinite(Number(v)) ? Number(v) : null;
  }

  return full;
}

function normalizeAbilities(abilities = {}) {
  const full = buildAbilitiesFull({ draftAbilities: abilities || {} });

  return Object.fromEntries(
    Object.entries(full || {}).map(([k, v]) => [k, v == null ? null : Number(v)])
  );
}

function buildWindowMeta(evalDate) {
  const isoDate = toIsoDateOnly(evalDate);
  const dateObj = parseIsoDateOnly(isoDate);

  if (!dateObj) {
    return {
      evalDate: null,
      windowKey: 'undated',
      windowStart: null,
      windowEnd: null,
      sortTime: 0,
    };
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const windowMs = WINDOW_DAYS * dayMs;
  const time = dateObj.getTime();
  const bucketIndex = Math.floor(time / windowMs);
  const startMs = bucketIndex * windowMs;
  const endMs = startMs + windowMs - dayMs;

  const start = new Date(startMs);
  const end = new Date(endMs);

  const windowStart = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, '0')}-${String(start.getUTCDate()).padStart(2, '0')}`;
  const windowEnd = `${end.getUTCFullYear()}-${String(end.getUTCMonth() + 1).padStart(2, '0')}-${String(end.getUTCDate()).padStart(2, '0')}`;

  return {
    evalDate: isoDate,
    windowKey: clean(`${windowStart}_${windowEnd}`),
    windowStart,
    windowEnd,
    sortTime: startMs,
  };
}

function buildFormEntry({ draft, formId, now }) {
  const abilities = normalizeAbilities(draft?.abilities || {});
  const windowMeta = buildWindowMeta(draft?.evalDate);

  return {
    id: formId,
    evalDate: windowMeta.evalDate,
    windowKey: windowMeta.windowKey,
    windowStart: windowMeta.windowStart,
    windowEnd: windowMeta.windowEnd,
    evaluatorId: clean(draft?.evaluatorId) || clean(draft?.createdById) || null,
    source: clean(draft?.source) || 'abilitiesForm',
    growthStage: abilities?.growthStage ?? null,
    abilities,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeStoredForm(form = {}) {
  const abilities = normalizeAbilities(form?.abilities || {});
  const windowMeta = buildWindowMeta(form?.evalDate);

  return {
    ...form,
    id: clean(form?.id) || makeId('abilForm'),
    evalDate: windowMeta.evalDate,
    windowKey: clean(form?.windowKey) || windowMeta.windowKey,
    windowStart: clean(form?.windowStart) || windowMeta.windowStart,
    windowEnd: clean(form?.windowEnd) || windowMeta.windowEnd,
    evaluatorId: clean(form?.evaluatorId) || null,
    source: clean(form?.source) || 'abilitiesForm',
    growthStage: abilities?.growthStage == null ? null : Number(abilities.growthStage),
    abilities,
    createdAt: form?.createdAt ?? null,
    updatedAt: form?.updatedAt ?? null,
  };
}

function diffDays(dateA, dateB) {
  const a = dateA instanceof Date ? dateA.getTime() : null;
  const b = dateB instanceof Date ? dateB.getTime() : null;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.floor(Math.abs(a - b) / (24 * 60 * 60 * 1000));
}

function formatDateOnly(dateObj) {
  if (!(dateObj instanceof Date) || Number.isNaN(dateObj.getTime())) return null;
  const yyyy = dateObj.getUTCFullYear();
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function averageGrowthStage(values = []) {
  const nums = values
    .map((v) => toNum(v, null))
    .filter((v) => Number.isFinite(v));

  if (!nums.length) return null;
  return roundToHalf(nums.reduce((sum, n) => sum + n, 0) / nums.length);
}

function groupFormsByWindow(forms = []) {
  const normalized = forms
    .map((raw) => normalizeStoredForm(raw))
    .map((form) => ({
      ...form,
      __evalDateObj: parseIsoDateOnly(form?.evalDate),
    }))
    .sort((a, b) => {
      const aTime = a?.__evalDateObj?.getTime?.() ?? 0;
      const bTime = b?.__evalDateObj?.getTime?.() ?? 0;
      return aTime - bTime;
    });

  const windows = [];
  let currentWindow = null;

  for (const form of normalized) {
    const formDate = form?.__evalDateObj || null;

    if (!currentWindow) {
      currentWindow = {
        windowIndex: 1,
        windowKey: null,
        windowStart: formatDateOnly(formDate),
        windowEnd: formatDateOnly(formDate),
        evalDates: form?.evalDate ? [form.evalDate] : [],
        forms: [form],
        __startDateObj: formDate,
        __endDateObj: formDate,
      };
      continue;
    }

    const currentEndDate = currentWindow.__endDateObj || currentWindow.__startDateObj || null;
    const gapFromCurrentWindow = diffDays(formDate, currentEndDate);

    if (gapFromCurrentWindow != null && gapFromCurrentWindow <= 56) {
      currentWindow.forms.push(form);
      if (form?.evalDate) currentWindow.evalDates.push(form.evalDate);

      if (
        formDate instanceof Date &&
        !Number.isNaN(formDate.getTime()) &&
        (
          !(currentWindow.__endDateObj instanceof Date) ||
          Number.isNaN(currentWindow.__endDateObj.getTime()) ||
          formDate.getTime() > currentWindow.__endDateObj.getTime()
        )
      ) {
        currentWindow.__endDateObj = formDate;
        currentWindow.windowEnd = formatDateOnly(formDate);
      }

      continue;
    }

    currentWindow.windowKey = `${currentWindow.windowStart || 'undated'}_${currentWindow.windowEnd || 'undated'}`;
    windows.push(currentWindow);

    currentWindow = {
      windowIndex: windows.length + 1,
      windowKey: null,
      windowStart: formatDateOnly(formDate),
      windowEnd: formatDateOnly(formDate),
      evalDates: form?.evalDate ? [form.evalDate] : [],
      forms: [form],
      __startDateObj: formDate,
      __endDateObj: formDate,
    };
  }

  if (currentWindow) {
    currentWindow.windowKey = `${currentWindow.windowStart || 'undated'}_${currentWindow.windowEnd || 'undated'}`;
    windows.push(currentWindow);
  }

  return windows.map((window) => ({
    windowIndex: window.windowIndex,
    windowKey: window.windowKey,
    windowStart: window.windowStart,
    windowEnd: window.windowEnd,
    evalDates: [...new Set(window.evalDates.filter(Boolean))].sort(),
    forms: window.forms.map((form) => {
      const { __evalDateObj, ...cleanForm } = form;
      return cleanForm;
    }),
  }));
}

function averageRatings(values = []) {
  const nums = values.filter((v) => isFilled(v)).map((v) => Number(v));
  if (!nums.length) return null;
  return roundToHalf(nums.reduce((sum, n) => sum + n, 0) / nums.length);
}

function resolveWindowGrowthStage(forms = []) {
  return averageGrowthStage(forms.map((form) => form?.growthStage));
}

function buildWindowSnapshot(windowBucket = {}) {
  const forms = Array.isArray(windowBucket?.forms) ? windowBucket.forms : [];
  const evaluators = Array.from(
    new Set(forms.map((f) => clean(f?.evaluatorId)).filter(Boolean))
  );

  const mergedAbilities = {};

  for (const item of abilitiesList) {
    const id = item?.id;
    if (!id) continue;

    if (id === 'growthStage') {
      mergedAbilities[id] = resolveWindowGrowthStage(forms);
      continue;
    }

    const values = forms.map((form) => form?.abilities?.[id]);
    mergedAbilities[id] = averageRatings(values);
  }

  return {
    windowIndex: windowBucket?.windowIndex || null,
    windowKey: windowBucket?.windowKey || 'undated',
    windowStart: windowBucket?.windowStart || null,
    windowEnd: windowBucket?.windowEnd || null,
    formsCount: forms.length,
    evaluatorsCount: evaluators.length,
    evaluatorIds: evaluators,
    evalDates: [...new Set(forms.map((f) => f?.evalDate).filter(Boolean))].sort(),
    abilities: mergedAbilities,
  };
}

function resolveWindowMergeStrategy(prevWindow = null, nextWindow = null) {
  const prevEnd = parseIsoDateOnly(prevWindow?.windowEnd);
  const nextStart = parseIsoDateOnly(nextWindow?.windowStart);
  const gapDays = diffDays(prevEnd, nextStart);

  if (gapDays == null) {
    return { gapDays: null, mode: 'replace', oldWeight: 0, newWeight: 1 };
  }
  if (gapDays <= 112) {
    return { gapDays, mode: 'merge_70_30', oldWeight: 0.3, newWeight: 0.7 };
  }
  if (gapDays <= 183) {
    return { gapDays, mode: 'merge_80_20', oldWeight: 0.2, newWeight: 0.8 };
  }
  return { gapDays, mode: 'replace', oldWeight: 0, newWeight: 1 };
}

function mergeWindowAbilitiesHistory(windows = []) {
  if (!windows.length) {
    return {
      abilities: normalizeAbilities({}),
      lastWindowKey: null,
      windowsCount: 0,
      mergeLog: [],
    };
  }

  let merged = normalizeAbilities(windows[0]?.abilities || {});
  const mergeLog = [];

  for (let i = 1; i < windows.length; i += 1) {
    const prevWindow = windows[i - 1];
    const nextWindow = windows[i];
    const current = normalizeAbilities(nextWindow?.abilities || {});
    const strategy = resolveWindowMergeStrategy(prevWindow, nextWindow);

    if (strategy.mode === 'replace') {
      const replaced = {};

      for (const item of abilitiesList) {
        const id = item?.id;
        if (!id) continue;

        if (id === 'growthStage') {
          const nextGrowth = toNum(current?.growthStage, null);
          const prevGrowth = toNum(merged?.growthStage, null);
          replaced.growthStage = Number.isFinite(nextGrowth) ? nextGrowth : prevGrowth;
          continue;
        }

        const newVal = toNum(current?.[id], null);
        const oldVal = toNum(merged?.[id], null);
        replaced[id] = newVal == null ? oldVal : newVal;
      }

      merged = replaced;
      mergeLog.push({
        fromWindowKey: prevWindow?.windowKey || null,
        toWindowKey: nextWindow?.windowKey || null,
        gapDays: strategy.gapDays,
        mode: strategy.mode,
        oldWeight: strategy.oldWeight,
        newWeight: strategy.newWeight,
      });
      continue;
    }

    const next = {};

    for (const item of abilitiesList) {
      const id = item?.id;
      if (!id) continue;

      if (id === 'growthStage') {
        const nextGrowth = toNum(current?.growthStage, null);
        const prevGrowth = toNum(merged?.growthStage, null);
        next.growthStage = Number.isFinite(nextGrowth) ? nextGrowth : prevGrowth;
        continue;
      }

      const oldVal = toNum(merged?.[id], null);
      const newVal = toNum(current?.[id], null);

      if (newVal == null && oldVal == null) next[id] = null;
      else if (newVal == null) next[id] = oldVal;
      else if (oldVal == null) next[id] = newVal;
      else next[id] = roundToHalf(oldVal * strategy.oldWeight + newVal * strategy.newWeight);
    }

    merged = next;

    mergeLog.push({
      fromWindowKey: prevWindow?.windowKey || null,
      toWindowKey: nextWindow?.windowKey || null,
      gapDays: strategy.gapDays,
      mode: strategy.mode,
      oldWeight: strategy.oldWeight,
      newWeight: strategy.newWeight,
    });
  }

  return {
    abilities: merged,
    lastWindowKey: windows[windows.length - 1]?.windowKey || null,
    windowsCount: windows.length,
    mergeLog,
  };
}

function getDomainsMeta() {
  const map = {};

  for (const item of abilitiesList) {
    const domain = item?.domain;
    if (!domain) continue;

    if (!map[domain]) {
      map[domain] = {
        domain,
        domainLabel: item?.domainLabel || domain,
        items: [],
      };
    }

    map[domain].items.push(item);
  }

  return map;
}

function calcDomainFromAbilities(abilities = {}, domainMeta = {}) {
  const items = Array.isArray(domainMeta?.items) ? domainMeta.items : [];
  const countableItems = items.filter((item) => Number(item?.weight ?? 1) > 0);

  let weightedSum = 0;
  let filledWeight = 0;
  let filledCount = 0;
  let totalWeight = 0;

  const resolvedItems = items.map((item) => {
    const value = abilities?.[item.id] == null ? null : Number(abilities[item.id]);
    const weight = Number(item?.weight ?? 1);

    if (weight > 0) totalWeight += weight;
    if (weight > 0 && isFilled(value)) {
      weightedSum += value * weight;
      filledWeight += weight;
      filledCount += 1;
    }

    return {
      id: item.id,
      label: item.label,
      domain: item.domain,
      domainLabel: item.domainLabel,
      weight,
      value: isFilled(value) ? value : value == null ? null : Number(value),
    };
  });

  const score = filledWeight > 0 ? round1(weightedSum / filledWeight) : null;
  const coveragePct = totalWeight > 0 ? round1((filledWeight / totalWeight) * 100) : 0;

  let validity = 'invalid';
  let reliability = DOMAIN_RELIABILITY.low;

  if (filledCount >= 3 && coveragePct > 60) {
    validity = 'reliable';
    reliability = DOMAIN_RELIABILITY.high;
  } else if (filledCount >= 2 && coveragePct >= 35) {
    validity = 'partial';
    reliability = DOMAIN_RELIABILITY.medium;
  }

  return {
    domain: domainMeta?.domain || null,
    domainLabel: domainMeta?.domainLabel || null,
    score,
    filledCount,
    totalCount: countableItems.length,
    coveragePct,
    validity,
    reliability,
    items: resolvedItems,
    isValidForOverall: validity !== 'invalid',
  };
}

function calcDomainsResult(abilities = {}) {
  const domainsMeta = getDomainsMeta();
  const domains = Object.values(domainsMeta).map((meta) => calcDomainFromAbilities(abilities, meta));
  const byId = Object.fromEntries(domains.map((domain) => [domain.domain, domain]));

  return { domains, byId };
}

function calcWeightedOverallFromDomains(domainsById = {}, domainWeights = {}) {
  let sum = 0;
  let sumWeights = 0;
  let validDomainsCount = 0;
  let totalModelWeight = 0;

  for (const [domainId, domainWeight] of Object.entries(domainWeights)) {
    totalModelWeight += domainWeight;
    const domain = domainsById?.[domainId];
    if (!domain?.isValidForOverall) continue;
    if (!Number.isFinite(Number(domain?.score))) continue;

    sum += Number(domain.score) * domainWeight;
    sumWeights += domainWeight;
    validDomainsCount += 1;
  }

  const score = sumWeights > 0 ? roundToHalf(sum / sumWeights) : null;
  const coveragePct = totalModelWeight > 0 ? round1((sumWeights / totalModelWeight) * 100) : 0;

  return { score, validDomainsCount, coveragePct };
}

function resolveGrowthStageTableKey(growthStage) {
  const n = toNum(growthStage, null);
  if (!Number.isFinite(n)) return null;
  return clamp(Math.floor(n), 1, 5);
}

function buildDomainsMetaWithPotentialScores(domains = [], growthStage = null) {
  const growthStageTableKey = resolveGrowthStageTableKey(growthStage);
  const physicalAdj = PHYSICAL_GROWTH_ADJUSTMENTS[String(growthStageTableKey)] ?? 0;
  const finalAdj = FINAL_POTENTIAL_GROWTH_ADJUSTMENTS[String(growthStageTableKey)] ?? 0;

  return (domains || []).map((domain) => {
    const score = Number.isFinite(Number(domain?.score)) ? Number(domain.score) : null;

    if (score == null) {
      return {
        ...domain,
        potentialScore: null,
      };
    }

    let potentialScore = score;

    if (domain?.domain === 'physical') {
      potentialScore = clamp(
        roundToHalf(score + physicalAdj + finalAdj),
        ABILITY_SCORE_MIN,
        ABILITY_SCORE_MAX
      );
    } else {
      potentialScore = roundToHalf(score);
    }

    return {
      ...domain,
      potentialScore,
    };
  });
}

function calcPotentialScore(domainsById = {}, growthStage = null) {
  const adjustedDomains = { ...domainsById };

  const physical = domainsById?.physical || null;
  const basePhysicalScore = Number.isFinite(Number(physical?.score))
    ? Number(physical.score)
    : null;

  const growthStageTableKey = resolveGrowthStageTableKey(growthStage);
  const growthAdj = PHYSICAL_GROWTH_ADJUSTMENTS[String(growthStageTableKey)] ?? 0;
  const finalGrowthAdj = FINAL_POTENTIAL_GROWTH_ADJUSTMENTS[String(growthStageTableKey)] ?? 0;

  const adjustedPhysicalScore =
    basePhysicalScore == null
      ? null
      : clamp(round1(basePhysicalScore + growthAdj), ABILITY_SCORE_MIN, ABILITY_SCORE_MAX);

  adjustedDomains.physical = adjustedDomains.physical
    ? {
        ...adjustedDomains.physical,
        potentialAdjustedScore: adjustedPhysicalScore,
      }
    : null;

  let sum = 0;
  let sumWeights = 0;
  let validDomainsCount = 0;
  let totalModelWeight = 0;

  for (const [domainId, domainWeight] of Object.entries(POTENTIAL_DOMAIN_WEIGHTS)) {
    totalModelWeight += domainWeight;

    const domain = adjustedDomains?.[domainId];
    if (!domain?.isValidForOverall) continue;

    const score = domainId === 'physical' ? domain?.potentialAdjustedScore : domain?.score;
    if (!Number.isFinite(Number(score))) continue;

    sum += Number(score) * domainWeight;
    sumWeights += domainWeight;
    validDomainsCount += 1;
  }

  const basePotential = sumWeights > 0 ? sum / sumWeights : null;
  const finalPotential =
    basePotential == null
      ? null
      : clamp(roundToHalf(basePotential + finalGrowthAdj), ABILITY_SCORE_MIN, ABILITY_SCORE_MAX);

  const coveragePct = totalModelWeight > 0 ? round1((sumWeights / totalModelWeight) * 100) : 0;
  const physicalCoveragePct = domainsById?.physical?.coveragePct ?? 0;
  const hasPhysical = Boolean(domainsById?.physical?.isValidForOverall);

  return {
    score: finalPotential,
    basePotential: basePotential == null ? null : round2(basePotential),
    validDomainsCount,
    coveragePct,
    hasPhysical,
    physicalCoveragePct,
    physicalAdjustedScore: adjustedPhysicalScore,
    growthStageTableKey,
  };
}

function resolveOverallReliability({ validDomainsCount = 0, coveragePct = 0, evaluatorsCount = 0 }) {
  if (validDomainsCount >= 4 && coveragePct >= 75) {
    if (evaluatorsCount >= 2) return OVERALL_RELIABILITY.high;
    return OVERALL_RELIABILITY.medium;
  }
  if (validDomainsCount >= 3 && coveragePct >= 65) {
    return OVERALL_RELIABILITY.medium;
  }
  return OVERALL_RELIABILITY.low;
}

function resolvePotentialReliability({
  validDomainsCount = 0,
  coveragePct = 0,
  hasPhysical = false,
  physicalCoveragePct = 0,
  evaluatorsCount = 0,
}) {
  if (validDomainsCount >= 4 && coveragePct >= 80 && hasPhysical && physicalCoveragePct >= 35) {
    if (evaluatorsCount >= 2) return OVERALL_RELIABILITY.high;
    return OVERALL_RELIABILITY.medium;
  }
  if (validDomainsCount >= 4 && coveragePct >= 70) {
    return OVERALL_RELIABILITY.medium;
  }
  return OVERALL_RELIABILITY.low;
}

function buildFinalPlayerResult({ forms = [] }) {
  const groupedWindows = groupFormsByWindow(forms);
  const windowSnapshots = groupedWindows.map((bucket) => buildWindowSnapshot(bucket));
  const historyMerged = mergeWindowAbilitiesHistory(windowSnapshots);
  const mergedAbilities = normalizeAbilities(historyMerged.abilities || {});

  const domainsResult = calcDomainsResult(mergedAbilities);

  const domainsWithPotentialScores = buildDomainsMetaWithPotentialScores(
    domainsResult.domains,
    mergedAbilities?.growthStage ?? null
  );

  const domainsByIdWithPotential = Object.fromEntries(
    domainsWithPotentialScores.map((domain) => [domain.domain, domain])
  );

  const overallAbility = calcWeightedOverallFromDomains(domainsResult.byId, ABILITY_DOMAIN_WEIGHTS);
  const overallPotential = calcPotentialScore(domainsResult.byId, mergedAbilities?.growthStage ?? null);

  const allEvaluatorIds = Array.from(
    new Set(forms.map((f) => clean(f?.evaluatorId)).filter(Boolean))
  );

  const abilityReliability = resolveOverallReliability({
    validDomainsCount: overallAbility.validDomainsCount,
    coveragePct: overallAbility.coveragePct,
    evaluatorsCount: allEvaluatorIds.length,
  });

  const potentialReliability = resolvePotentialReliability({
    validDomainsCount: overallPotential.validDomainsCount,
    coveragePct: overallPotential.coveragePct,
    hasPhysical: overallPotential.hasPhysical,
    physicalCoveragePct: overallPotential.physicalCoveragePct,
    evaluatorsCount: allEvaluatorIds.length,
  });

  return {
    abilities: mergedAbilities,
    domainScores: Object.fromEntries(
      domainsWithPotentialScores.map((domain) => [domain.domain, domain.score])
    ),
    domainPotentialScores: Object.fromEntries(
      domainsWithPotentialScores.map((domain) => [domain.domain, domain.potentialScore])
    ),
    domainsMeta: domainsWithPotentialScores,
    level: overallAbility.score,
    levelPotential: overallPotential.score,
    reliability: {
      ability: abilityReliability,
      potential: potentialReliability,
    },
    coverage: {
      ability: overallAbility.coveragePct,
      potential: overallPotential.coveragePct,
      physical: overallPotential.physicalCoveragePct,
    },
    validDomainsCount: {
      ability: overallAbility.validDomainsCount,
      potential: overallPotential.validDomainsCount,
    },
    snapshotsMeta: {
      windowsCount: historyMerged.windowsCount,
      lastWindowKey: historyMerged.lastWindowKey,
      formsCount: forms.length,
      evaluatorsCount: allEvaluatorIds.length,
      evaluatorIds: allEvaluatorIds,
      mergeLog: historyMerged.mergeLog,
    },
    windows: windowSnapshots,
  };
}

function buildSlimDomainsMeta(domainsMeta = []) {
  return Array.isArray(domainsMeta)
    ? domainsMeta.map((domain) => ({
        domain: domain?.domain || null,
        score: domain?.score ?? null,
        potentialScore: domain?.potentialScore ?? null,
        filledCount: domain?.filledCount ?? 0,
        totalCount: domain?.totalCount ?? 0,
        coveragePct: domain?.coveragePct ?? 0,
        validity: domain?.validity || 'invalid',
        reliability: domain?.reliability || 'low',
      }))
    : [];
}

function buildLatestComputedPayload(finalResult = {}) {
  return {
    abilities: finalResult?.abilities || {},
    domainScores: finalResult?.domainScores || {},
    domainPotentialScores: finalResult?.domainPotentialScores || {},
    domainsMeta: buildSlimDomainsMeta(finalResult?.domainsMeta),
    level: finalResult?.level ?? null,
    levelPotential: finalResult?.levelPotential ?? null,
    reliability: finalResult?.reliability || { ability: 'low', potential: 'low' },
    coverage: finalResult?.coverage || { ability: 0, potential: 0, physical: 0 },
    validDomainsCount: finalResult?.validDomainsCount || { ability: 0, potential: 0 },
    snapshotsMeta: {
      windowsCount: finalResult?.snapshotsMeta?.windowsCount ?? 0,
      lastWindowKey: finalResult?.snapshotsMeta?.lastWindowKey || null,
      formsCount: finalResult?.snapshotsMeta?.formsCount ?? 0,
      evaluatorsCount: finalResult?.snapshotsMeta?.evaluatorsCount ?? 0,
    },
  };
}

function buildAbilitiesHistoryDoc({
  abilitiesData,
  effectiveAbilitiesDocId,
  playerId,
  allForms,
  finalResult,
  now,
}) {
  return {
    ...abilitiesData,
    docId: abilitiesData?.docId || effectiveAbilitiesDocId,
    playerId: abilitiesData?.playerId || playerId,
    formsAbilities: allForms,
    windowsAbilities: Array.isArray(finalResult?.windows) ? finalResult.windows : [],
    latestComputed: buildLatestComputedPayload(finalResult),
    updatedFrom: 'abilitiesEngineV2',
    updatedAt: now,
    createdAt: abilitiesData?.createdAt ?? now,
  };
}

function buildPlayerAbilitiesItem({
  current,
  itemId,
  effectiveAbilitiesDocId,
  finalResult,
  allForms,
  now,
}) {
  return {
    ...(current || {}),
    id: itemId,
    docAbilitiesId: effectiveAbilitiesDocId,
    abilities: finalResult?.abilities || {},
    domainScores: finalResult?.domainScores || {},
    domainPotentialScores: finalResult?.domainPotentialScores || {},
    domainsMeta: buildSlimDomainsMeta(finalResult?.domainsMeta),
    level: finalResult?.level ?? null,
    levelPotential: finalResult?.levelPotential ?? null,
    reliability: finalResult?.reliability || { ability: 'low', potential: 'low' },
    coverage: finalResult?.coverage || { ability: 0, potential: 0, physical: 0 },
    validDomainsCount: finalResult?.validDomainsCount || { ability: 0, potential: 0 },
    lastWindowKey: finalResult?.snapshotsMeta?.lastWindowKey || null,
    formsCount: finalResult?.snapshotsMeta?.formsCount ?? allForms.length,
    evaluatorsCount: finalResult?.snapshotsMeta?.evaluatorsCount ?? 0,
    windowsCount: finalResult?.snapshotsMeta?.windowsCount ?? 0,
    updatedFrom: 'abilitiesEngineV2',
    updatedAt: now,
    createdAt: current?.createdAt ?? now,
  };
}

function buildPublicAbilitiesDraft(payload = {}) {
  return {
    playerId: clean(payload?.playerId),
    evalDate: clean(payload?.evalDate),
    abilities: { ...(payload?.abilities || {}) },
    source: 'public_invite',
    evaluatorId: clean(payload?.evaluatorId),
    createdById: clean(payload?.evaluatorId),
    publicMeta: {
      inviteId: clean(payload?.inviteId),
      token: clean(payload?.token),
      evaluatorId: clean(payload?.evaluatorId),
      evaluatorName: clean(payload?.evaluatorName),
      evaluatorType: clean(payload?.evaluatorType),
      teamId: clean(payload?.teamId),
      teamName: clean(payload?.teamName),
      clubId: clean(payload?.clubId),
      clubName: clean(payload?.clubName),
    },
  };
}

async function submitAbilitiesInviteWithHistoryAdmin(payload = {}) {
  const inviteId = clean(payload?.inviteId);
  if (!inviteId) throw new Error('submitAbilitiesInviteWithHistory: inviteId is required');

  const playerId = clean(payload?.playerId);
  if (!playerId) throw new Error('submitAbilitiesInviteWithHistory: playerId is required');

  const draft = buildPublicAbilitiesDraft(payload);
  const formId = makeId('abilForm');
  const now = admin.firestore.FieldValue.serverTimestamp();
  const nowTs = admin.firestore.Timestamp.now();

  const playersAbilitiesRef = db.collection(PLAYERS_ABILITIES_COLLECTION).doc(PLAYERS_ABILITIES_DOC_ID);

  return db.runTransaction(async (tx) => {
    const inviteRef = db.collection('abilitiesInvites').doc(inviteId);
    const inviteSnap = await tx.get(inviteRef);

    if (!inviteSnap.exists) {
      throw new Error('invite not found');
    }

    const inviteData = inviteSnap.data() || {};
    if (inviteData?.active === false) {
      throw new Error('invite is not active');
    }
    if (inviteData?.status === 'submitted' || inviteData?.isSubmitted === true) {
      throw new Error('הטופס כבר הוגש');
    }
    if (clean(inviteData?.token) !== clean(payload?.token)) {
      throw new Error('token mismatch');
    }

    const playersSnap = await tx.get(playersAbilitiesRef);
    const playersData = playersSnap.exists ? (playersSnap.data() || {}) : {};
    const list = Array.isArray(playersData?.list) ? playersData.list : [];

    const idx = list.findIndex((x) => x?.id === playerId);
    const current = idx >= 0 ? (list[idx] || {}) : null;

    const effectiveAbilitiesDocId =
      clean(current?.docAbilitiesId) || makeId('abilDoc');

    const abilitiesDocRef = db.collection(ABILITIES_SHORTS_COLLECTION).doc(effectiveAbilitiesDocId);
    const abilitiesSnap = await tx.get(abilitiesDocRef);
    const abilitiesData = abilitiesSnap.exists ? (abilitiesSnap.data() || {}) : {};
    const prevFormsRaw = Array.isArray(abilitiesData?.formsAbilities)
      ? abilitiesData.formsAbilities
      : [];

    const newFormEntry = buildFormEntry({ draft, formId, now: nowTs });
    const allForms = [...prevFormsRaw, newFormEntry].map((form) => normalizeStoredForm(form));
    const finalResult = buildFinalPlayerResult({ forms: allForms });

    const nextAbilitiesDoc = buildAbilitiesHistoryDoc({
      abilitiesData,
      effectiveAbilitiesDocId,
      playerId,
      allForms,
      finalResult,
      now: nowTs,
    });

    const nextItem = buildPlayerAbilitiesItem({
      current,
      itemId: playerId,
      effectiveAbilitiesDocId,
      finalResult,
      allForms,
      now: nowTs,
    });

    const nextList =
      idx >= 0
        ? list.map((item, i) => (i === idx ? nextItem : item))
        : [...list, nextItem];

    const nextPlayersAbilitiesDoc = {
      ...playersData,
      docId: playersData?.docId || PLAYERS_ABILITIES_DOC_ID,
      docName: playersData?.docName || 'playersAbilities',
      list: nextList,
      updatedAt: nowTs,
      createdAt: playersData?.createdAt ?? nowTs,
    };

    tx.set(abilitiesDocRef, nextAbilitiesDoc, { merge: true });
    tx.set(playersAbilitiesRef, nextPlayersAbilitiesDoc, { merge: true });

    tx.update(inviteRef, {
      isSubmitted: true,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      submissionId: formId,
      submittedById: clean(payload?.evaluatorId),
      submittedByName: clean(payload?.evaluatorName) || clean(payload?.evaluatorType),
      response: {
        source: 'public_invite',
        playerId: clean(payload?.playerId),
        playerName: clean(payload?.playerName),
        evalDate: clean(payload?.evalDate),
        abilities: { ...(payload?.abilities || {}) },
        domainScores: { ...(payload?.domainScores || {}) },
      },
    });

    return {
      ok: true,
      inviteId,
      submissionId: formId,
      abilitiesDocId: effectiveAbilitiesDocId,
      playerId,
      summary: {
        formsCount: nextItem.formsCount,
        windowsCount: nextItem.windowsCount ?? 0,
        level: nextItem.level,
        levelPotential: nextItem.levelPotential,
      },
    };
  });
}

exports.submitPublicAbilitiesInvite = onRequest(
  { region: 'europe-west1' },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method not allowed' });
      }

      const payload = req.body || {};
      const result = await submitAbilitiesInviteWithHistoryAdmin(payload);

      return res.status(200).json(result);
    } catch (error) {
      console.error('submitPublicAbilitiesInvite failed', error);
      return res.status(500).json({
        error: clean(error?.message) || 'submit failed',
      });
    }
  }
);
