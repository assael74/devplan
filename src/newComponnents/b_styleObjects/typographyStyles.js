// 📁 /b_styleObjects/typographyStyles.js
import { typeBackground } from './Colors.js';

export const getTypographyProps = (type = '', level = 'title', isMobile, theme) => {
  const baseColor = typeBackground[type]?.text || '#050505';
  const bgc = typeBackground[type]?.bgc || 'transparent';

  const common = {
    color: baseColor,
    fontWeight: 'lg',
    direction: 'rtl',
    textAlign: 'center',
    px: 0.5,
    py: 0.25,
    backgroundColor: 'transparent'
  };

  const levelMap = {
    title: {
      level: 'body-xs',
      sx: {
        ...common,
        letterSpacing: 1,
        fontWeight: 700,
        fontSize: isMobile ? '0.65rem' : '0.8rem',
        backgroundColor: 'transparent'
      }
    },
    subtitle: {
      level: 'body-xs',
      sx: {
        ...common,
        borderRadius: 14,
        border: '1px solid',
        borderColor: theme.vars.palette.neutral.outlinedBorder,
        transition: 'border-color .2s, box-shadow .2s, transform .2s',
        '&:hover': {
          borderColor: theme.vars.palette.primary.outlinedBorder,
          boxShadow: 'md',
          transform: 'translateY(-2px)',
        },
        boxShadow: 'sm',
        backgroundColor: 'transparent',
        fontSize: isMobile ? '0.55rem' : '0.65rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontStyle: 'italic'
      }
    }
  };

  return levelMap[level] || levelMap.title;
};
