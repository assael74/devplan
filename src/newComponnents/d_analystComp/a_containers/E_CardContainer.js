import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cardContainerProps, boxUpCardProps, boxTitleProps  } from './containersStyle/E_CardStyle.js';
import { boxChipsProps, bgc } from './containersStyle/E_CardStyle.js';
import { Card, CardContent, Chip, Box, useTheme } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import { typeBackground } from '../../b_styleObjects/Colors.js'
import { processChips } from './chipsUtils/processChips.js'
import { getTitleSubtitleByType } from './titleUtils/processTitle.js'
import { getAvatarWithChip } from './avatarUtils/processAvater.js'
import { getCardContentByType } from './contentUtils/getCardContentByType';
import GenericEditMenu from './F_GenericEditMenu'

export default function CardContainer({
  type,
  item,
  view,
  onClick,
  actions,
  columns,
  sx = {},
  idDisplay,
  formProps,
  allShorts,
  chips = [],
  content = null,
  getInitialState,
  menuComponent = null,
}) {
  const [update, setUpdate] = React.useState(() => getInitialState(item));
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const flexBasis = {
    menu: '15%',
    image: '10%',
    name: isMobile ? '55%' : '65%',
    chips: isMobile ? '100%' : '100%'
  };

  const { title, subtitle } = getTitleSubtitleByType({
    type,
    item,
    formProps,
    isMobile,
    theme,
    onNavigate: (to, e) => {
      e?.stopPropagation?.();
      navigate(to);
    },
  });
  const avatarArea = getAvatarWithChip(type, item, flexBasis, isMobile, formProps);
  const { mainChip, primaryChip, secondaryChip, tertiaryChip } = processChips({
    chips,
    formProps,
    type,
    isMobile
  });

  const hasOpenDebt =
    (type === 'players' && item.isOpenPayment) ||
    (type === 'payments' && item.status?.id === 'new');

  const shadow = hasOpenDebt
    ? '-2px -1px 12px 2px rgba(211, 47, 47, 0.6)'
    : isMobile ? 'lg' : 'sm';

  const cardProps = {
    bg: bgc(item, formProps, type),
    isMobile,
    shadow,
    hasOpenDebt
  }

  return (
    <Card {...cardContainerProps({ onClick, sx, ...cardProps })} onClick={() => type !== 'clubs' && onClick(item)}>

      {/* ציפ מחוץ למעטפת */}
      <Box sx={{ position: 'absolute', top: -13, left: -13, zIndex: 2, }}>
        {mainChip}
      </Box>

      {/* כותרת הכרטיס */}
      <Box {...boxUpCardProps(isMobile)}>

        {/* כפתור פעולות */}
        <GenericEditMenu
          type={type}
          item={item}
          view={view}
          update={update}
          columns={columns}
          actions={actions}
          isMobile={isMobile}
          flexBasis={flexBasis}
          setUpdate={setUpdate}
          formProps={formProps}
          allShorts={allShorts}
          idDisplay={idDisplay}
          menuComponent={menuComponent}
        />

        {/* תמונה */}
        <Box>
          {avatarArea}
        </Box>

        {/* כותרת וכותרת משנה */}
        <Box {...boxTitleProps(flexBasis, type)}>
          {title}
          {subtitle}
        </Box>

         {/* אזור ציפים */}
         {(primaryChip || secondaryChip) && (
           <Box {...boxChipsProps(flexBasis, isMobile)}>
             {primaryChip ?? <Chip sx={{ visibility: 'hidden' }} />}
             {secondaryChip ?? <Chip sx={{ visibility: 'hidden' }} />}
             {tertiaryChip ?? <Chip sx={{ visibility: 'hidden' }} />}
           </Box>
         )}
      </Box>

      {getCardContentByType(type, item, formProps, isMobile) &&
        <CardContent sx={{ direction: 'rtl', textAlign: 'right' }}>
          {getCardContentByType(type, item, formProps, isMobile)}
        </CardContent>
      }
    </Card>
  );
}
