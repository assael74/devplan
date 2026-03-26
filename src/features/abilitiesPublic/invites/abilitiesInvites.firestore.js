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

function getInvitesCollection() {
  return collection(db, ABILITIES_INVITES_COLLECTION)
}

function buildAbilitiesInviteFirestorePayload(invite = {}) {
  return {
    token: clean(invite.token),

    playerId: clean(invite.playerId),
    playerName: clean(invite.playerName),

    teamId: clean(invite.teamId),
    teamName: clean(invite.teamName),

    clubId: clean(invite.clubId),
    clubName: clean(invite.clubName),

    evaluatorId: clean(invite.evaluatorId),
    evaluatorName: clean(invite.evaluatorName),

    createdById: clean(invite.createdById || invite.evaluatorId),
    createdByName: clean(invite.createdByName || invite.evaluatorName),

    status: clean(invite.status || 'sent'),
    formType: clean(invite.formType || 'abilities'),
    source: clean(invite.source || 'playerAbilitiesModule'),

    link: clean(invite.link),
    whatsappText: clean(invite.whatsappText),
    note: clean(invite.note),

    active: invite.active !== false,
    isOpened: Boolean(invite.isOpened),
    isSubmitted: Boolean(invite.isSubmitted),
    opensCount: Number(invite.opensCount || 0),

    openedAt: invite.openedAt || null,
    lastOpenedAt: invite.lastOpenedAt || null,
    submittedAt: invite.submittedAt || null,
    expiresAt: invite.expiresAt || null,

    defaults: invite.defaults || null,
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

  console.log('GET TOKEN', cleanToken)

  const snap = await getDocs(q)

  console.log('GET TOKEN', cleanToken)
  console.log('SNAP EMPTY', snap.empty)
  console.log('DOCS', snap.docs.map((d) => ({ id: d.id, ...d.data() })))

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
