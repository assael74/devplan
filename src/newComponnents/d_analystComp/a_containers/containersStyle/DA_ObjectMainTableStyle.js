import { useTheme } from '@mui/joy/styles';
import { typeBackground } from '../../../b_styleObjects/Colors';

/// ObjectMainTableContainer
export const tableProps = {
  size: 'sm',
  variant: 'outlined',
  borderAxis: 'both',
  stickyHeader: true,
  sx: {
    tableLayout: 'fixed',
    minWidth: { xs: 300, md: 700 },
    width: '100%',
    '& thead th': {
      // דואג שהכותרת תישאר קבועה ותכסה את השורות שמתחת
      position: 'sticky',
      top: 'var(--table-sticky-top, 0px)', // ניתן לשלוט בהיסט מבחוץ
      zIndex: 2,
      bgcolor: 'background.surface', // רקע אטום כדי שלא "יציץ" תוכן דרכה
    },
    '& th, & td': {
      textAlign: 'center',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      fontSize: { xs: '0.75rem', md: '0.875rem' },
      // p: '4px 8px',
    },
    '&::-webkit-scrollbar': {
      width: 'var(--scroll-size)',
      height: 'var(--scroll-size)',
    },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--joy-palette-neutral-400)',
      borderRadius: 9999,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'var(--joy-palette-neutral-500)',
    },
  }
}

export const boxDataProps = {
  sx: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    direction: 'rtl',
    textAlign: 'center'
  }
}

export const useThStyle = (type) => {
  const theme = useTheme();
  const typeBg = typeBackground?.[type] || {};

  return (col = {}) => {
    const isHeader = col?.isHeader;
    const isSpecial = col?.id === 'bodyStart' || col?.id === 'bodyEnd';

    return {
      style: {
        backgroundColor: isHeader
          ? typeBg.bgc || theme.palette.neutral[200]
          : isSpecial
          ? theme.palette.background.surface
          : theme.palette.background.level1,
        color: isHeader
          ? typeBg.text || theme.palette.text.primary
          : theme.palette.text.primary,
        padding: '4px 8px',
        whiteSpace: 'nowrap',
        width: col?.width || 'auto',
        textAlign: 'center',
        fontSize: isHeader ? theme.vars.fontSize.sm : theme.vars.fontSize.xs,
        fontWeight: isHeader ? theme.vars.fontWeight.md : theme.vars.fontWeight.sm,
      },
    };
  };
};

export const expandedStyle = (theme, open) => ({
  sx: {
    border: '1px solid',
    borderColor: theme.vars.palette.divider || '#ddd',
    borderRadius: 'sm',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
  }
})

export const iconBoxProps = {
  sx: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    justifyContent: 'center',
  }
}

export const boxTableWraperProps = {
  sx: {
    '--table-sticky-top': '0px',
    '--scroll-size': '6px',
    maxHeight: { xs: '60dvh', md: '56vh' },
    overflowY: 'auto',
    overflowX: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'var(--joy-palette-neutral-400) transparent',
    scrollbarGutter: 'stable',
    WebkitOverflowScrolling: 'touch',
    bgcolor: 'background.surface',
    borderRadius: 'sm',
  }
}
