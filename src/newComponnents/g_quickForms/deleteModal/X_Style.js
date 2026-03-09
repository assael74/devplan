/// DeleteConfirmModal
export const modalProps = {
  sx: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)', // רקע מטושטש
    backgroundColor: 'rgba(0,0,0,0.1)', // מעט כהות
    px: 2,
  }
}

export const sheetProps = {
  variant: "outlined",
  sx: {
    p: 2,
    borderRadius: 'md',
    boxShadow: 'xs',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
    textAlign: 'center',
    direction: 'rtl',
  }
}
