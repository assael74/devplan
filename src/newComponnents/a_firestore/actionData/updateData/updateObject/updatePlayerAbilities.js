/// a_firestore/actionData/updateData\updateObject/updatePlayerAbilities.js
import { arrayUnion } from "firebase/firestore";
import { updateShortItemList } from '../updateShortItemList';
import { updateShortItem } from '../updateShortItem';

export async function updatePlayerAbilities({
  playerId,
  newFormData,
  docId,
  onSuccess,
  onError
}) {
  //הוספת טופס abilities למסמך abilitiesShorts
  await updateShortItem({
    collection: 'abilitiesShorts',
    docId,
    updates: {
      formsAbilities: arrayUnion(newFormData),
    },
    onSuccess,
    onError,
  });
}
