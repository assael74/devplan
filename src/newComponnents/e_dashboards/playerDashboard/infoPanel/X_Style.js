/// PlayerInfoTab
export const yearGroupBoxProps = {
  sx: {
    py: 0.5,
    borderRadius: 'sm',
    border: '1px solid',
    borderColor: 'primary.solidBg',
    minWidth: 70,
    textAlign: 'center',
    fontWeight: 'lg',
    backgroundColor: 'warning.softBg',
    color: 'primary.900',
    boxShadow: 'md',
  }
};

export const clearButtProps = {
  size:"md",
  variant:"outlined",
  color:"neutral",
  sx:{ borderRadius: 'md' }
}

export const actionsBoxProps = {
  sx:{
    position: 'sticky', // או 'absolute' לפי מבנה העמוד
    bottom: 0,
    backgroundColor: '#fff', // או רקע מותאם – כדי שלא יתנגש עם תוכן אחר
    pt: 2,
    pb: 2,
    mt: 4,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1,
    zIndex: 10,
  }
}
