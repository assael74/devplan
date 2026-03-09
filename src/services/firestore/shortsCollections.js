// src/services/firestore/shortsCollections.js
import { collection } from 'firebase/firestore'
import { db } from '../firebase/firebase.js'

export const clubsShortsRef = collection(db, 'clubsShorts')
export const teamsShortsRef = collection(db, 'teamsShorts')
export const playersShortsRef = collection(db, 'playersShorts')
export const scoutingShortsRef = collection(db, 'scoutingShorts')
export const meetingsShortsRef = collection(db, 'meetingShorts')
export const paymentsShortsRef = collection(db, 'playerPaymentsShorts')
export const rolesShortsRef = collection(db, 'rolesShorts')

export const gamesShortsRef = collection(db, 'gamesShorts')
export const gameStatsShortsRef = collection(db, 'gameStatsShorts')

export const videoAnalysisShortsRef = collection(db, 'videoAnalysisShorts')
export const videosShortsRef = collection(db, 'videosShorts')

export const tagsShortsRef = collection(db, 'tagsShorts')

export const abilitiesShortsCollectionRef = collection(db, "abilitiesShorts")
