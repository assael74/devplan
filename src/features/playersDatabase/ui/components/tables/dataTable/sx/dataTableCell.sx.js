// features/playersDatabase/ui/components/tables/dataTable/sx/dataTableCell.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const dataTableCellSx = {
  cellLink: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
    gap: 0.65,
    color: 'inherit',
    textDecoration: 'none',
    cursor: 'pointer',
    borderRadius: 5,
    transition: 'color 140ms ease, background-color 140ms ease',

    '&:hover, &:focus-visible': {
      color: devPlanColors.primaryDark,
      bgcolor: '#dce8f0',
      outline: 'none',
    },

    '&:hover [data-link-indicator], &:focus-visible [data-link-indicator]': {
      opacity: 1,
      transform: 'scale(1)',
    },
  },

  cellLinkText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  cellLinkIndicator: {
    flex: '0 0 auto',
    width: 5,
    height: 5,
    borderRadius: '50%',
    bgcolor: 'currentColor',
    opacity: 0.72,
    transform: 'scale(1)',
    transition: 'opacity 140ms ease, transform 140ms ease',
  },
}
