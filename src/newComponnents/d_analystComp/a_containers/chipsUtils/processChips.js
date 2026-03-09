// 📁 chipsUtils/processChips.js
import { interpretChip } from './buildChip';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex';
import { Chip } from '@mui/joy';
import { cardChipsProps } from './X_Style';

export function processChips({ chips = [], formProps = {}, type = '', isMobile = false }) {
  const chipMap = {};

  chips.forEach((chip) => {
    if (!chip || chip.value === null || chip.idItem === '') return;

    const interpreted = interpretChip({ ...chip, isMobile }, formProps, type);
    const icon = interpreted.icon || iconUi({ id: chip.id || interpreted.label });

    const shouldShowLabel = interpreted?.showLabel?.sm !== undefined
      ? isMobile ? interpreted.showLabel.sm : interpreted.showLabel.md
      : !isMobile;

    const isLinkChip = chip.idItem === 'link';
    const isEmpty = chip.value === '';
    
    const chipContent = (
      <Chip
        {...cardChipsProps({ ...interpreted, icon }, isMobile)}
        disabled={isLinkChip && isEmpty}
        onClick={(e) => e.stopPropagation()}
        sx={{
          ...(cardChipsProps({ ...interpreted, icon }, isMobile)?.sx || {}),
          cursor: isLinkChip && !isEmpty ? 'pointer' : 'default'
        }}
      >
        {shouldShowLabel && interpreted.label}
      </Chip>
    );

    if (isLinkChip) {
      chipMap[chip.id] = (
        <div onClick={(e) => e.stopPropagation()}>
          {isEmpty ? (
            chipContent
          ) : (
            <a
              href={chip.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              {chipContent}
            </a>
          )}
        </div>
      );
    } else {
      chipMap[chip.id] = chipContent;
    }
  });

  return {
    mainChip: chipMap.main || null,
    primaryChip: chipMap.primary || null,
    secondaryChip: chipMap.secondary || null,
    tertiaryChip: chipMap.tertiary || null,
  };
}
