// src/features/abilitiesPublic/invites/abilitiesInvites.firestore.js

import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../../services/firebase/firebase'

const ABILITIES_INVITES_COLLECTION = 'abilitiesInvites'

function clean(value) {
  return String(value ?? '').trim()
}

function cleanBool(value, fallback = false) {
  if (typeof value === 'boolean') return value
  return fallback
}

function buildEntitySnapshot(entity = {}, config = {}) {
  const out = {}

  for (const key of config.stringKeys || []) {
    out[key] = clean(entity?.[key])
  }

  return out
}

function getInvitesCollection() {
  return collection(db, ABILITIES_INVITES_COLLECTION)
}

function buildAbilitiesInviteFirestorePayload(invite = {}) {
  return {
    token: clean(invite.token),
    formType: clean(invite.formType || 'abilities'),
    source: clean(invite.source || 'playerAbilitiesModule'),

    player: buildEntitySnapshot(invite.player, {
      stringKeys: ['id', 'fullName', 'photo'],
    }),

    evaluator: buildEntitySnapshot(invite.evaluator, {
      stringKeys: ['id', 'fullName', 'photo', 'type'],
    }),

    team: buildEntitySnapshot(invite.team, {
      stringKeys: ['id', 'teamName', 'photo', 'teamYear'],
    }),

    club: buildEntitySnapshot(invite.club, {
      stringKeys: ['id', 'clubName', 'photo'],
    }),

    createdById: clean(invite.createdById || invite?.evaluator?.id),
    createdByName: clean(invite.createdByName || invite?.evaluator?.fullName),

    status: clean(invite.status || 'sent'),

    link: clean(invite.link),
    whatsappText: clean(invite.whatsappText),
    note: clean(invite.note),

    active: cleanBool(invite.active, true),
    isOpened: cleanBool(invite.isOpened, false),
    isSubmitted: cleanBool(invite.isSubmitted, false),
    opensCount: Number(invite.opensCount || 0),

    sentAt: invite.sentAt || null,
    openedAt: invite.openedAt || null,
    lastOpenedAt: invite.lastOpenedAt || null,
    submittedAt: invite.submittedAt || null,
    expiresAt: invite.expiresAt || null,

    defaults: {
      roleId: clean(invite?.defaults?.roleId),
    },

    meta: invite.meta || null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

export async function saveAbilitiesInvite(invite) {
  if (!invite || typeof invite !== 'object') {
    throw new Error('saveAbilitiesInvite: invite is required')
  }

  if (!clean(invite.token)) {
    throw new Error('saveAbilitiesInvite: token is required')
  }

  const payload = buildAbilitiesInviteFirestorePayload(invite)
  const ref = await addDoc(getInvitesCollection(), payload)

  return {
    id: ref.id,
    ...payload,
  }
}

export async function getAbilitiesInviteByToken(token) {
  const cleanToken = clean(token)
  if (!cleanToken) return null

  const q = query(
    getInvitesCollection(),
    where('token', '==', cleanToken),
    where('active', '==', true),
    limit(1)
  )

  const snap = await getDocs(q)

  if (snap.empty) return null

  const row = snap.docs[0]

  return {
    id: row.id,
    ...row.data(),
  }
}

export async function markAbilitiesInviteOpened(inviteId, currentInvite = null) {
  const cleanId = clean(inviteId)

  if (!cleanId) {
    throw new Error('markAbilitiesInviteOpened: inviteId is required')
  }

  const currentOpensCount = Number(currentInvite?.opensCount || 0)
  const ref = doc(db, ABILITIES_INVITES_COLLECTION, cleanId)

  await updateDoc(ref, {
    isOpened: true,
    openedAt: currentInvite?.openedAt || serverTimestamp(),
    lastOpenedAt: serverTimestamp(),
    opensCount: currentOpensCount + 1,
    updatedAt: serverTimestamp(),
  })

  return true
}

export async function markAbilitiesInviteSubmitted(inviteId, patch = {}) {
  const cleanId = clean(inviteId)

  if (!cleanId) {
    throw new Error('markAbilitiesInviteSubmitted: inviteId is required')
  }

  const ref = doc(db, ABILITIES_INVITES_COLLECTION, cleanId)

  await updateDoc(ref, {
    isSubmitted: true,
    status: 'submitted',
    submittedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    ...(patch?.submissionId ? { submissionId: patch.submissionId } : {}),
    ...(patch?.submittedByName ? { submittedByName: patch.submittedByName } : {}),
    ...(patch?.submittedById ? { submittedById: patch.submittedById } : {}),
    ...(patch?.response ? { response: patch.response } : {}),
  })

  return true
}
