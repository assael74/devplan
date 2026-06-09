// functions/src/triggers/roles/onPendingRegistrationCreated.trigger.js

const { onDocumentWritten } = require('firebase-functions/v2/firestore')
const { admin } = require('../../config/admin')
const { clean } = require('../../shared/clean')
const { REGION } = require('../../services/notifications/scheduleNotify')
const {
  createPendingRegistrationNotification,
} = require('../../services/roles/createPendingRegistrationNotification')

const ROLES_INFO_DOC_PATH = 'rolesShorts/pDOcZnt5THXwyYtp7ddh'
const DEFAULT_ADMIN_EMAILS = ['assael74@gmail.com']

function getAdminEmails() {
  const configured = String(process.env.ADMIN_NOTIFICATION_EMAILS || '')
    .split(',')
    .map(clean)
    .filter(Boolean)

  return configured.length ? configured : DEFAULT_ADMIN_EMAILS
}

function getList(data) {
  return Array.isArray(data?.list) ? data.list : []
}

function mapById(list = []) {
  const map = new Map()

  for (const item of list) {
    const id = clean(item?.id)
    if (!id) continue
    map.set(id, item)
  }

  return map
}

function getAddedItems(beforeList = [], afterList = []) {
  const beforeMap = mapById(beforeList)
  const added = []

  for (const item of afterList) {
    const id = clean(item?.id)
    if (!id) continue
    if (!beforeMap.has(id)) added.push(item)
  }

  return added
}

function isPendingRegistration(role = {}) {
  return (
    clean(role?.source) === 'registration' &&
    clean(role?.status) === 'pending'
  )
}

async function getAdminRecipientUserIds() {
  const emails = getAdminEmails()
  const users = await Promise.all(
    emails.map(async (email) => {
      try {
        return await admin.auth().getUserByEmail(email)
      } catch (error) {
        console.error('onPendingRegistrationCreated admin lookup failed', {
          email,
          code: error?.code,
          message: error?.message,
        })
        return null
      }
    })
  )

  return users.map((user) => clean(user?.uid)).filter(Boolean)
}

async function handlePendingRegistration(role) {
  const roleId = clean(role?.id)
  if (!roleId) {
    console.log('onPendingRegistrationCreated skip: missing roleId')
    return
  }

  const authUid = clean(role?.authUid)
  let authUser = null

  if (authUid) {
    try {
      authUser = await admin.auth().getUser(authUid)
    } catch (error) {
      console.error('onPendingRegistrationCreated auth user lookup failed', {
        roleId,
        authUid,
        code: error?.code,
        message: error?.message,
      })
    }
  }

  const recipientUserIds = await getAdminRecipientUserIds()
  if (!recipientUserIds.length) {
    console.log('onPendingRegistrationCreated skip: no admin recipients', {
      roleId,
    })
    return
  }

  await Promise.all(
    recipientUserIds.map((recipientUserId) =>
      createPendingRegistrationNotification({
        recipientUserId,
        roleId,
        authUid,
        fullName: role?.fullName,
        email: role?.email || authUser?.email,
        phone: role?.phone,
        deepLink: '/home?mode=staff',
      })
    )
  )
}

const onPendingRegistrationCreated = onDocumentWritten(
  {
    region: REGION,
    document: ROLES_INFO_DOC_PATH,
  },
  async (event) => {
    const beforeData = event.data?.before?.data?.() || {}
    const afterData = event.data?.after?.data?.() || {}

    const beforeList = getList(beforeData)
    const afterList = getList(afterData)
    const addedItems = getAddedItems(beforeList, afterList).filter(isPendingRegistration)

    if (!addedItems.length) {
      console.log('onPendingRegistrationCreated skip: no pending registrations detected')
      return
    }

    for (const role of addedItems) {
      await handlePendingRegistration(role)
    }
  }
)

module.exports = {
  onPendingRegistrationCreated,
}
