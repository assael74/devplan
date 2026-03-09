import { useSnackbar } from './SnackbarProvider';
import { useEffect, useState } from 'react';

export function isClubComplete(club) {
  if (!club) return false;

  const requiredFields = [
    'id',
    'active',
    'clubName',
  ];

  const result = requiredFields.every(
    (field) => club[field] !== undefined && club[field] !== ''
  );

  if (!result) {
    const missingFields = requiredFields.filter(
    (field) =>
      club[field] === undefined ||
      club[field] === '' ||
      (Array.isArray(club[field]) && club[field].length === 0)
    );
    console.log('🔴 חסרים שדות:', missingFields);
  }

  return requiredFields.every(
    (field) => club[field] !== undefined && club[field] !== ''
  );
}

export function isTeamComplete(team) {
  if (!team) return false;

  const requiredFields = [
    'id',
    'active',
    'project',
    'teamName',
    'teamYear',
    'clubId'
  ];

  const result = requiredFields.every(
    (field) => team[field] !== undefined && team[field] !== ''
  );

  if (!result) {
    const missingFields = requiredFields.filter(
    (field) =>
      team[field] === undefined ||
      team[field] === '' ||
      (Array.isArray(team[field]) && team[field].length === 0)
    );
    console.log('🔴 חסרים שדות:', missingFields);
  }

  return requiredFields.every(
    (field) => team[field] !== undefined && team[field] !== ''
  );
}

export function isPlayerComplete(player) {
  if (!player) return false;

  const hasTeam = player.teamId
  const hasClub = player.clubId

  const requiredFields = [
    'id',
    'playerFirstName',
    'playerLastName',
    'playerFullName',
    'birth',
    'type',
    'teamId',
    'clubId',
    'active',
    'positions'
  ];

  const result = requiredFields.every(
    (field) => player[field] !== undefined && player[field] !== ''
  );

  if (!result || !hasTeam || !hasClub) {
    const missingFields = [
      ...requiredFields.filter(
        (field) =>
          player[field] === undefined ||
          player[field] === '' ||
          (Array.isArray(player[field]) && player[field].length === 0)
      ),
      ...(hasTeam ? [] : ['teamId']),
      ...(hasClub ? [] : ['clubId']),
    ];
    //console.log('🔴 חסרים שדות:', missingFields, player);
    return false;
  }

  return true;
}

export function isPaymentComplete(payment) {
  if (!payment) return false;

  const requiredFields = [
    'id',
    'price',
    'type',
    'status',
    'paymentFor',
    'playerId'
  ];

  const result = requiredFields.every(
    (field) => payment[field] !== undefined && payment[field] !== ''
  );

  if (!result) {
    const missingFields = requiredFields.filter(
    (field) =>
      payment[field] === undefined ||
      payment[field] === '' ||
      (Array.isArray(payment[field]) && payment[field].length === 0)
    );
    console.log('🔴 חסרים שדות:', missingFields);
  }

  return requiredFields.every(
    (field) => payment[field] !== undefined && payment[field] !== ''
  );
}

export function isMeetingComplete(meeting) {
  if (!meeting) return false;

  const requiredFields = [
    'id',
    'meetingDate',
    'meetingHour',
    'meetingFor',
    'status',
    'type',
    'playerId'
  ];

  const result = requiredFields.every(
    (field) => meeting[field] !== undefined && meeting[field] !== ''
  );

  if (!result) {
    const missingFields = requiredFields.filter(
    (field) =>
      meeting[field] === undefined ||
      meeting[field] === '' ||
      (Array.isArray(meeting[field]) && meeting[field].length === 0)
    );
    console.log('🔴 חסרים שדות:', missingFields);
  }

  return requiredFields.every(
    (field) => meeting[field] !== undefined && meeting[field] !== ''
  );
}

export function isVideoComplete(video) {
  if (!video) return false;

  const requiredFields = [
    'id',
    'link',
  ];

  const result = requiredFields.every(
    (field) => video[field] !== undefined && video[field] !== ''
  );

  if (!result) {
    const missingFields = requiredFields.filter(
    (field) =>
      video[field] === undefined ||
      video[field] === '' ||
      (Array.isArray(video[field]) && video[field].length === 0)
    );
    console.log('🔴 חסרים שדות:', missingFields);
  }

  return requiredFields.every(
    (field) => video[field] !== undefined && video[field] !== ''
  );
}

export function isGameComplete(game) {
  if (!game) return false;

  const requiredFields = [
    'id',
    'gameDate',
    'gameHour',
    'teamId',
    'rivel'
  ];

  const result = requiredFields.every(
    (field) => game[field] !== undefined && game[field] !== ''
  );

  if (!result) {
    const missingFields = requiredFields.filter(
    (field) =>
      game[field] === undefined ||
      game[field] === '' ||
      (Array.isArray(game[field]) && game[field].length === 0)
    );
    console.log('🔴 חסרים שדות:', missingFields);
  }

  return requiredFields.every(
    (field) => game[field] !== undefined && game[field] !== ''
  );
}

const objectValidators = {
  players: isPlayerComplete,
  teams: isTeamComplete,
  videos: isVideoComplete,
  clubs: (c) => c?.id && c?.clubName,
  payments: (p) => p?.id && p?.playerId && p?.price,
  meetings: (m) => m?.id && m?.meetingDate && m?.playerId,
};

const checkObjectReady = (type, item) => {
  const validator = objectValidators[type];
  return validator ? validator(item) : !!item?.id;
};

const getSuccessMessage = (type) => {
  switch (type) {
    case 'players':
      return '🎉 שחקן נוסף בהצלחה';
    case 'teams':
      return '🎉 קבוצה נוספה בהצלחה';
    case 'clubs':
      return '🎉 מועדון נוסף בהצלחה';
    case 'payments':
      return '💰 תשלום נוסף בהצלחה';
    case 'videos':
      return '💰 וידאו כללי נוסף בהצלחה';
    case 'videoAnalysis':
      return '💰 ניתוח וידאו נוסף בהצלחה';
    case 'meetings':
      return '📅 פגישה נוספה בהצלחה';
    default:
      return '✅ נוסף בהצלחה';
  }
};

export function useObjectAddStatus({
  clear,
  list = [],
  objectId,
  isWaiting,
  type = 'players',
}) {
  const { showSnackbar } = useSnackbar();
  const [hasFired, setHasFired] = useState(false);

  useEffect(() => {
    //console.log("📥 useObjectAddStatus running", { type, objectId, isWaiting, list });
    if (!isWaiting || !objectId || hasFired) return;

    const addedItem = list.find((item) => item.id === objectId);
    const isReady = checkObjectReady(type, addedItem);

    if (isReady) {
      showSnackbar(getSuccessMessage(type));
      setHasFired(true);
      clear();
    }
  }, [list, objectId, isWaiting, hasFired, type]);
}
