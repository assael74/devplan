import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../FbConfig.js";
import moment from 'moment';
// shortsRefs.js
export const shortsRefs = {
  clubs: {
    info: { collection: "clubsShorts", docId: "7gQMJVni7QDVabieoGsm" },
  },
  teams: {
    info: { collection: "teamsShorts", docId: "Fx1rytOdDJee4DtesHSj" },
    staff: { collection: "teamsShorts", docId: "nRhPUiQA8z9nWTmlUoEn" },
  },
  players: {
    team: { collection: "playersShorts", docId: "2alnt6Ibw5mozoYdk65j" },
    info: { collection: "playersShorts", docId: "93YWbxDb9uV7YprEukhg" },
    playerMeetings: { collection: "playersShorts", docId: "QORDDk6ku90hUuHrseve" },
    playerPayments: { collection: "playersShorts", docId: "hBXi4ncY2Cskka7mKhn5" },
    name: { collection: "playersShorts", docId: "hZ8i5PK5TqPRMYIveg4a" },
    proInfo: { collection: "playersShorts", docId: "kq1KXaHpIy4Trp7tuCFB" },
    parents: { collection: "playersShorts", docId: "pr4alU7a1c2MxTivUXEb" },
    //stats: { collection: "playersShorts", docId: "q954y8HZ4nXRMuWCYxEp" },
    analysis: { collection: "playersShorts", docId: "qSaFLdLy84IAImz5DcZA" },
    abilities: { collection: "playersShorts", docId: "CxI3w6ztc9KfTxJLP8zS" },
  },
  payments: {
    opretive: { collection: "playerPaymentsShorts", docId: "gmgxFJa9xI1wc28JvE1X" },
    profit: { collection: "playerPaymentsShorts", docId: "pQoiqVKSc94FsAqpCYlT" },
  },
  meetings: {
    date: { collection: "meetingShorts", docId: "8V1UmfUSpQwdx9LdWzeD" },
    video: { collection: "meetingShorts", docId: "Kc1fm8c1RdrBQhAuavuK" },
    player: { collection: "meetingShorts", docId: "ZTSPHFV9uAfYNxw33I0b" },
    notes: { collection: "meetingShorts", docId: "osfDQ7rWAKa3dwpey6zE" },
  },
  games: {
    players: { collection: "gamesShorts", docId: "41kNZj14UWekfr8KBBK8" },
    scoutPlayers: { collection: "gamesShorts", docId: "JvCmK5ua8SMCxzeqJWcQ" },
    info: { collection: "gamesShorts", docId: "N7XGvQajspQjInGeic5H" },
    time: { collection: "gamesShorts", docId: "ieMXdjDAkhbe0W2DlJw8" },
    result: { collection: "gamesShorts", docId: "xrSqD98vpvQOMwB9cp4b" },
  },
  videos: {
    videoNames: { collection: "videosShorts", docId: "TaNSHspuCBvjlKTHd6Zf" },
    videoLinks: { collection: "videosShorts", docId: "elQ6gEvQc4I07fnY6BjU" },
    videoComments: { collection: "videosShorts", docId: "pmxOHtxpLArFok7ddtYR" },
    videoTags: { collection: "videosShorts", docId: "tiKWGR2Wsv1miNaVbfGi" },
  },
  videoAnalyses: {
    analysisComments: { collection: "videoAnalysisShorts", docId: "06MoPvl9f9ZFSAlDP4Yu" },
    analysisInfo: { collection: "videoAnalysisShorts", docId: "BVL0OvaOA0OmZFoZmLEN" },
    analysisPlayers: { collection: "videoAnalysisShorts", docId: "CJpsVfV44EKT2n6YnTIn" },
    analysisTags: { collection: "videoAnalysisShorts", docId: "T9e0yEehpXk5SUcpj6Fj" },
  },
  tags: {
    tagInfo: { collection: "tagsShorts", docId: "LkifVVOk7xhkjB8wYEBz" },
  },
  roles: {
    info: { collection: "rolesShorts", docId: "pDOcZnt5THXwyYtp7ddh" },
    contact: { collection: "rolesShorts", docId: "ZasRKFOBG1VOhSAKfwa5" },
  },
  scouting: {
    info: { collection: "scoutingShorts", docId: "P2qROYuW7zveaJKah3xA" },
    games: { collection: "scoutingShorts", docId: "SfAIsZkn1XtMYNrsY5HN" },
  },
};

const IS_DEV = true;
// addShortItem.js
export async function addShortItem({ collection, docId, item, onSuccess, onError }) {
  const ref = doc(db, collection, docId);

  if (IS_DEV) {
    console.log(`[DEV] Skipping Firestore write to ${collection}/${docId}`, item);
    onSuccess?.();
    return;
  }

  try {
    await updateDoc(ref, { list: arrayUnion(item) });
    console.log(`[shorts] Added to ${collection}/${docId}`);
    onSuccess?.();
  } catch (err) {
    console.error(`[shorts] Error in ${collection}/${docId}:`, err.message);
    onError?.(err);
  }
}
