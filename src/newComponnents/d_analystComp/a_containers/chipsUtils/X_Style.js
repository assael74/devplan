import { typeBackground } from '../../../b_styleObjects/Colors.js'

export const cardChipsProps = (chip, isMobile) => {
  const widthVal = chip.width?.[isMobile ? 'sm' : 'md'];
  const prInMobil = !chip?.showLabel?.sm ? 0.5 : 0.8
  const variant = chip.label === 'פרויקט' ? 'solid' : chip.label === 'התקיימה' ? 'solid' : 'outlined'
  const color = chip.label === 'נקבעה' ? 'success' : 'neutral'
  
  return {
    variant: variant,
    color: color,
    startDecorator: chip.icon,
    size: 'sm',
    sx: {
      fontSize: isMobile ? '0.55rem' : '0.55rem',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      justifyContent: 'center',
      direction: 'rtl',
      textAlign: 'center',
    }
  }
}
