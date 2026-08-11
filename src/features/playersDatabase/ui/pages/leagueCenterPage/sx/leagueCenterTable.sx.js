// src/features/playersDatabase/ui/pages/leagueCenterPage/sx/leagueCenterTable.sx.js

export const leagueCenterTableSx = {
  tablePanel: {
    width: '100%',
    height: '100%',
    borderColor: '#c8d7e2',
    boxShadow: '0 10px 24px rgba(16, 43, 64, 0.075)',
  },

  tableScroll: {
    border: 0,
    borderRadius: 0,

    '& table': {
      fontSize: 12,
    },
    '& th': {
      px: 1,
      py: 0.85,
      bgcolor: '#f4f7f9',
      borderBottom: '1px solid #b8c8d4',
    },
    '& thead th:first-of-type': {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    '& thead th:last-of-type': {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    '& td': {
      px: 1,
      py: 0.7,
      borderBottomColor: '#dce5eb',
    },
    '& button': {
      minWidth: 0,
      minHeight: 28,
      px: 1.25,
      fontSize: 12,
    },
  },

  tableBodyScroll: {
    height: '100%',
    maxHeight: 'none',
  },

  noRowHoverTable: {
    '& tbody tr:hover': {
      bgcolor: 'transparent',
    },

    '& tbody tr:hover td': {
      bgcolor: 'transparent',
      '--TableCell-dataBackground': 'transparent',
    },
  },
}
