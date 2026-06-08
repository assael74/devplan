// src/services/auth/registerExternalUser.js

import { authApi } from './auth.api.js'
import { createShort } from '../firestore/shorts/shortsCreate.js'
import { makeId } from '../../utils/id.js'

const clean = (value) => String(value ?? '').trim()
const cleanEmail = (value) => clean(value).toLowerCase()

export async function registerExternalUser({ email, password, fullName, phone }) {
  const credential = await authApi.register({ email, password })
  const firebaseUser = credential?.user

  if (!firebaseUser?.uid) {
    throw new Error('missing firebase user')
  }

  const role = await createPendingRoleForRegisteredUser({
    firebaseUser,
    profile: {
      fullName,
      email,
      phone,
    },
  })

  return {
    firebaseUser,
    role,
  }
}

async function createPendingRoleForRegisteredUser({ firebaseUser, profile }) {
  const id = makeId()
  const now = Date.now()

  const infoItem = {
    id,
    userId: '',
    authUid: firebaseUser.uid,

    fullName: clean(profile?.fullName),
    active: false,
    status: 'pending',
    type: '',

    clubsId: [],
    teamsId: [],

    moduleAccess: {},

    source: 'registration',
    createdAt: now,
    updatedAt: now,
  }

  await createShort({
    shortKey: 'roles.rolesInfo',
    item: infoItem,
  })

  const contactItem = {
    id,
    email: cleanEmail(firebaseUser.email || profile?.email),
    phone: clean(profile?.phone),
  }

  await createShort({
    shortKey: 'roles.rolesContact',
    item: contactItem,
  })

  return {
    ...infoItem,
    ...contactItem,
  }
}
