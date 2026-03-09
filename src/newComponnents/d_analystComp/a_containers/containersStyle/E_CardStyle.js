import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { getTeamColor } from '../../../x_utils/colorUtiles.js'
import { typeBackground } from '../../../b_styleObjects/Colors.js'
/// CardContainer
export const cardContainerProps = ({onClick, sx, isMobile, bg, shadow, hasOpenDebt}) => {
  return {
    variant: "outlined",
    sx:{
      position: 'relative',
      overflow: 'visible',
      cursor: onClick ? 'pointer' : 'default',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      p: isMobile ? 0.8 : 1.5,
      borderRadius: 'lg',
      boxShadow: 'sm',
      position: 'relative',
      backgroundColor: bg,
      boxShadow: shadow,
      border: hasOpenDebt ? '1px solid red' : undefined,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: shadow,
        cursor: 'pointer'
      },
      ...sx
    }
  }
}

export const boxUpCardProps = (isMobile) => {
  return {
    sx:{
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'flex-start',
      gap: 1,
      position: 'relative',
      flexWrap: 'wrap',
    }
  }
}

export const boxTitleProps = (flexBasis, type) => {
  return {
    sx: {
      flexBasis: flexBasis.name,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      mt: type === 'players' ? -2.3 : -1.5
    }
  }
}

export const boxChipsProps = (flexBasis, isMobile) => {
  return {
    sx: {
      mt: -1,
      flexBasis: flexBasis.chips,
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 0.5,
      justifyContent: 'flex-start',
      alignItems: 'center',
      direction: 'rtl',
    }
  }
}

const defaultBg = (type) => (typeBackground?.[type]?.bgc) || 'white';
  // אם אין לך – הוסף עזר לקבוצת מועדון
const getClubColor = (clubId, formProps) => {
  if (!clubId) return null;
  const club = formProps?.clubs?.find(
    c => c.id === clubId || c.clubId === clubId
  );
  const bg = String(club?.color?.bg ?? '').trim();
  return bg ? { bg } : null;
};

// עזר למציאת clubId כשהאייטם הוא קבוצה/שחקן
const getClubIdFromItem = (item, formProps) => {
  if (item?.clubId) return item.clubId;
  if (item?.teamId) {
    const t = formProps?.teams?.find(x => x.id === item.teamId);
    return t?.clubId;
  }
  // אם האייטם עצמו הוא קבוצה (id שקיים ב-teams)
  const asTeam = formProps?.teams?.find(x => x.id === item?.id);
  return asTeam?.clubId;
};

export const bgc = (item = {}, formProps = {}, type) => {
  const trim = v => String(v ?? '').trim();

  // 1) צבע עצמי (אם מוגדר באייטם)
  const selfBg = trim(item?.color?.bg);
  if (selfBg) return selfBg;

  // 2) צבע קבוצה (אם יש teamId או שהאייטם עצמו הוא קבוצה)
  const teamId =
    item?.teamId ||
    (formProps?.teams?.some(t => t.id === item?.id) ? item.id : undefined);

  if (teamId) {
    const teamBg = trim((getTeamColor(teamId, formProps) || {}).bg);
    if (teamBg) return teamBg;
  }

  // 3) צבע מועדון – תמיד בסיס סופי
  const clubId = getClubIdFromItem(item, formProps);
  const clubBg = trim((getClubColor(clubId, formProps) || {}).bg);
  if (clubBg) return clubBg;

  // 4) ברירת מחדל
  return defaultBg(type);
}
