import { updateShortItem } from '../updateShortItem'; // הנתיב לפי המבנה שלך

export const updateGameStats = async (props, actions = {}) => {
  const {
    id,
    playerStats,
    teamStats,
    rivelStats
  } = props;

  const updates = {};
  if (playerStats !== undefined) updates.playerStats = playerStats;
  if (teamStats !== undefined) updates.teamStats = teamStats;
  if (rivelStats !== undefined) updates.rivelStats = rivelStats;
  
  const onSuccess = () => actions?.setAlert?.('updateGameStats');
  const onError = (err) => console.error('[updateGameStats]', err.message);

  await updateShortItem({
    collection: 'gameStatsShorts',
    docId: id,
    updates,
    onSuccess,
    onError,
  });

  actions?.onClose?.();
};
