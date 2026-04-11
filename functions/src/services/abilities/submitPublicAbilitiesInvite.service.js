// functions\src\services\abilities\submitPublicAbilitiesInvite.service.js

const { admin, db } = require('../../config/admin')
const { clean } = require('../../shared/clean')
const { makeId } = require('../../shared/makeId')

const { getUserNotificationRef } = require('../notifications/notifications.repo')
const { buildAbilitiesFormSubmittedNotification } = require('./buildAbilitiesFormSubmittedNotification')

const { PLAYERS_ABILITIES_DOC_ID, getPlayersAbilitiesRef } = require('../../repositories/abilities/playersAbilities.repo')
const { getAbilitiesDocRef } = require('../../repositories/abilities/abilitiesShorts.repo')

const { buildPublicAbilitiesDraft } = require('./buildPublicAbilitiesDraft')
const { buildAbilitiesHistoryDoc } = require('./buildAbilitiesHistoryDoc')
const { buildPlayerAbilitiesItem } = require('./buildPlayerAbilitiesItem')

const {
  buildFormEntry,
  normalizeStoredForm,
} = require('../../domain/abilities/engine/abilitiesHistory.forms')

const {
  buildFinalPlayerResult,
} = require('../../domain/abilities/engine/abilitiesHistory.scoring')

async function submitPublicAbilitiesInviteService(payload = {}) {
  const inviteId = clean(payload?.inviteId)
  if (!inviteId) {
    throw new Error('submitAbilitiesInviteWithHistory: inviteId is required')
  }

  const playerId = clean(payload?.playerId)
  if (!playerId) {
    throw new Error('submitAbilitiesInviteWithHistory: playerId is required')
  }

  const draft = buildPublicAbilitiesDraft(payload)
  const formId = makeId('abilForm')
  const now = admin.firestore.FieldValue.serverTimestamp()
  const nowTs = admin.firestore.Timestamp.now()

  const playersAbilitiesRef = getPlayersAbilitiesRef()

  return db.runTransaction(async (tx) => {
    const inviteRef = db.collection('abilitiesInvites').doc(inviteId)
    const inviteSnap = await tx.get(inviteRef)

    if (!inviteSnap.exists) {
      throw new Error('invite not found')
    }

    const inviteData = inviteSnap.data() || {}

    if (inviteData?.active === false) {
      throw new Error('invite is not active')
    }

    if (inviteData?.status === 'submitted' || inviteData?.isSubmitted === true) {
      throw new Error('הטופס כבר הוגש')
    }

    if (clean(inviteData?.token) !== clean(payload?.token)) {
      throw new Error('token mismatch')
    }

    const playersSnap = await tx.get(playersAbilitiesRef)
    const playersData = playersSnap.exists ? (playersSnap.data() || {}) : {}
    const list = Array.isArray(playersData?.list) ? playersData.list : []

    const idx = list.findIndex((item) => item?.id === playerId)
    const current = idx >= 0 ? (list[idx] || {}) : null

    const effectiveAbilitiesDocId =
      clean(current?.docAbilitiesId) || makeId('abilDoc')

    const abilitiesDocRef = getAbilitiesDocRef(effectiveAbilitiesDocId)
    const abilitiesSnap = await tx.get(abilitiesDocRef)
    const abilitiesData = abilitiesSnap.exists ? (abilitiesSnap.data() || {}) : {}

    const prevFormsRaw = Array.isArray(abilitiesData?.formsAbilities)
      ? abilitiesData.formsAbilities
      : []

    const newFormEntry = buildFormEntry({
      draft,
      formId,
      now: nowTs,
    })

    const allForms = [...prevFormsRaw, newFormEntry].map((form) =>
      normalizeStoredForm(form)
    )

    const finalResult = buildFinalPlayerResult({ forms: allForms })

    const nextAbilitiesDoc = buildAbilitiesHistoryDoc({
      abilitiesData,
      effectiveAbilitiesDocId,
      playerId,
      allForms,
      finalResult,
      now: nowTs,
    })

    const nextItem = buildPlayerAbilitiesItem({
      current,
      itemId: playerId,
      effectiveAbilitiesDocId,
      finalResult,
      allForms,
      now: nowTs,
    })

    const nextList =
      idx >= 0
        ? list.map((item, i) => (i === idx ? nextItem : item))
        : [...list, nextItem]

    const nextPlayersAbilitiesDoc = {
      ...playersData,
      docId: playersData?.docId || PLAYERS_ABILITIES_DOC_ID,
      docName: playersData?.docName || 'playersAbilities',
      list: nextList,
      updatedAt: nowTs,
      createdAt: playersData?.createdAt ?? nowTs,
    }

    tx.set(abilitiesDocRef, nextAbilitiesDoc, { merge: true })
    tx.set(playersAbilitiesRef, nextPlayersAbilitiesDoc, { merge: true })

    tx.update(inviteRef, {
      isSubmitted: true,
      status: 'submitted',
      submittedAt: now,
      updatedAt: now,
      submissionId: formId,
      submittedById: clean(payload?.evaluatorId),
      submittedByName:
        clean(payload?.evaluatorName) || clean(payload?.evaluatorType),
      response: {
        source: 'public_invite',
        playerId: clean(payload?.playerId),
        playerName: clean(payload?.playerName),
        evalDate: clean(payload?.evalDate),
        abilities: { ...(payload?.abilities || {}) },
        domainScores: { ...(payload?.domainScores || {}) },
      },
    })

    const recipientUserId = clean(inviteData?.createdById)

    if (recipientUserId) {
      const notification = buildAbilitiesFormSubmittedNotification({
        inviteId,
        submissionId: formId,
        playerId,
        playerName:
          clean(inviteData?.playerName) || clean(payload?.playerName) || '',
        actorName:
          clean(payload?.evaluatorName) || clean(payload?.evaluatorType) || '',
        deepLink: playerId ? `/players/${playerId}?tab=abilities` : '',
        nowTs,
      })

      const notificationRef = getUserNotificationRef(
        recipientUserId,
        notification.id
      )

      tx.set(notificationRef, notification, { merge: false })
    }

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
    }
  })
}

module.exports = { submitPublicAbilitiesInviteService }
