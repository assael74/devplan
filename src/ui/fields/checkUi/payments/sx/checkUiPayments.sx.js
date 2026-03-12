// ui/fields/checkUi/payments/sx/checkUiPayments.sx.js

export const optionSheetProps = ({ isMobile, isSelected, isDone, isSoftRed, id }) => {
  const isInvoice = id === 'invoice'

  return {
    variant: isSelected ? 'soft' : 'outlined',
    color: isSelected ? (isDone ? 'success' : isInvoice ? 'warning' : 'danger') : 'neutral',
    sx: {
      width: isMobile ? 88 : 132,
      minHeight: isMobile ? 66 : 74,
      px: 1.25,
      py: 1,
      textAlign: 'center',
      borderRadius: 'md',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.5,
      borderWidth: isSelected ? 2 : 1,
      boxShadow: isSelected ? 'md' : 'xs',
      transition:
        'transform .14s ease, box-shadow .18s ease, background-color .18s ease, border-color .18s ease, color .18s ease',

      ...(isSelected
        ? isDone
          ? {
              bgcolor: '#dff2e5',
              borderColor: '#3f8a5a',
              color: '#185531',
            }
          : isInvoice
            ? {
                bgcolor: '#ffefdb',
                borderColor: '#c88718',
                color: '#7f5200',
              }
            : {
                bgcolor: '#ffe4e4',
                borderColor: '#c75454',
                color: '#842020',
              }
        : isDone
          ? {
              bgcolor: '#f7fcf8',
              borderColor: '#cfe7d6',
              color: '#5f7d68',
            }
          : isInvoice
            ? {
                bgcolor: '#fffaf2',
                borderColor: '#edd9b0',
                color: '#8b7650',
              }
            : isSoftRed
              ? {
                  bgcolor: '#fff8f8',
                  borderColor: '#efdbdb',
                  color: '#8f6666',
                }
              : {
                  bgcolor: 'background.surface',
                  borderColor: 'divider',
                  color: 'text.secondary',
                }),

      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: 'md',
        ...(isDone
          ? {
              bgcolor: '#d8efdf',
              borderColor: '#36794f',
            }
          : isInvoice
            ? {
                bgcolor: '#ffe9cc',
                borderColor: '#be7c10',
              }
            : {
                bgcolor: '#ffdede',
                borderColor: '#bf4d4d',
              }),
      },

      '&:active': {
        transform: 'scale(0.985)',
        boxShadow: 'sm',
      },
    },
  }
}

export const chipActiveProps = {
  sx: {
    cursor: 'pointer',
    fontWeight: 'md',
    px: 1,
    py: 0.5,
    borderRadius: 'lg',
    fontSize: 'sm',
  }
}
