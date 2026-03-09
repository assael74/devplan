import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../../../FbConfig";
import { getDiffFields } from "../helpers/getDiffFields";
import { IS_DEV } from '../config';

export async function updateGameStatsPartial({
  id,
  field,
  playerId,
  patch,
  actions = {},
  debug = IS_DEV,
}) {
  console.log({
    id, field, playerId, patch
  })
  if (!id || !field) throw new Error("[updateGameStatsPartial] missing id or field");
  if (field === "playerStats" && !playerId) {
    throw new Error("[updateGameStatsPartial] playerId is required when field==='playerStats'");
  }
  if (!patch || typeof patch !== "object") {
    throw new Error("[updateGameStatsPartial] patch must be an object");
  }

  const ref = doc(db, "gameStatsShorts", id);

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error(`gameStatsShorts/${id} not found`);
    const data = snap.data();

    if (field === "playerStats") {
      const list = Array.isArray(data.playerStats) ? data.playerStats : [];
      const idx = list.findIndex(p => p?.playerId === playerId);
      if (idx === -1) throw new Error(`playerId '${playerId}' not found in playerStats`);

      const current = list[idx] || {};
      const diff = getDiffFields(current, { ...current, ...patch });

      // אין שינוי? לא לכתוב
      if (Object.keys(diff).length === 0) {
        if (debug) console.log("[updateGameStatsPartial] no changes for playerId:", playerId);
        return;
      }

      const updated = { ...current, ...diff };
      const newList = [...list];
      newList[idx] = updated;

      if (debug) {
        console.group("[updateGameStatsPartial] DEBUG playerStats");
        console.log("docId:", id);
        console.log("playerId:", playerId);
        console.log("current:", current);
        console.log("patch:", patch);
        console.log("diff:", diff);
        console.log("updated:", updated);
        console.groupEnd();
        return;
      }

      tx.update(ref, { playerStats: newList });
    } else if (field === "teamStats" || field === "rivelStats") {
      const current = data[field] || {};
      const diff = getDiffFields(current, { ...current, ...patch });

      if (Object.keys(diff).length === 0) {
        if (debug) console.log(`[updateGameStatsPartial] no changes for field '${field}'`);
        return;
      }

      const updated = { ...current, ...diff };

      if (debug) {
        console.group(`[updateGameStatsPartial] DEBUG ${field}`);
        console.log("docId:", id);
        console.log("current:", current);
        console.log("patch:", patch);
        console.log("diff:", diff);
        console.log("updated:", updated);
        console.groupEnd();
        return;
      }

      tx.update(ref, { [field]: updated });
    } else {
      throw new Error(`[updateGameStatsPartial] unsupported field '${field}'`);
    }
  })
  .then(() => {
    actions?.setAlert?.("updateGameStats");
    actions?.onClose?.();
  })
  .catch((err) => {
    console.error("[updateGameStatsPartial] ❌", err.message);
    throw err;
  });
}
