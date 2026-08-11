// features/playersDatabase/ui/components/tables/dataTable/sx/dataTableColumns.sx.js

import { devPlanColors } from '../../../../../../../ui/core/theme/Colors.js'

export const dataTableColumnsSx = {
  indexColumn: {
    px: 0.5,
    textAlign: 'center',
  },

  avatarColumn: {
    px: 0.5,
    textAlign: 'center',
  },

  nameColumn: {
    textAlign: 'left !important',
  },

  nameHeader: {
    textAlign: 'left !important',
    pl: 1.5,
  },

  nameCell: {
    textAlign: 'left !important',
    pl: 1.5,
  },

  nameContent: {
    minWidth: 0,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.65,
  },

  nameText: {
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  centerColumn: {
    textAlign: 'center',
  },

  numericColumn: {
    textAlign: 'center',
  },

  profileColumn: {
    minWidth: 0,
  },

  actionsColumn: {
    textAlign: 'center',
  },

  avatarImage: {
    width: 28,
    height: 28,
    display: 'block',
    mx: 'auto',
    objectFit: 'cover',
    borderRadius: '50%',
    border: `1px solid ${devPlanColors.primaryLight}`,
  },
}
