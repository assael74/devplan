import { db } from '../../FbConfig.js'
import { collection, where, getDocs, getDoc, query, onSnapshot } from "firebase/firestore";

export const clubsShortsCollectionRef = collection(db, "clubsShorts")

export const teamsShortsCollectionRef = collection(db, "teamsShorts")

export const playersShortsCollectionRef = collection(db, "playersShorts")

export const videoAnalysisShortsCollectionRef = collection(db, "videoAnalysisShorts")

export const videosShortsCollectionRef = collection(db, "videosShorts")

export const paymentsShortsCollectionRef = collection(db, "playerPaymentsShorts")

export const gamesShortsCollectionRef = collection(db, "gamesShorts")

export const gameStatsShortsCollectionRef = collection(db, "gameStatsShorts")

export const meetingsShortsCollectionRef = collection(db, "meetingShorts")

export const scoutingShortsCollectionRef = collection(db, "scoutingShorts")

export const individualShortsCollectionRef = collection(db, "individualPlayers")

export const tagsShortsCollectionRef = collection(db, "tagsShorts")

export const abilitiesShortsCollectionRef = collection(db, "abilitiesShorts")

export const rolesShortsCollectionRef = collection(db, "rolesShorts")
