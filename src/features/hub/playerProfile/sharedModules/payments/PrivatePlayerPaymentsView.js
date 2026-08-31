import React, { useMemo, useState } from 'react'
import moment from 'moment'
import {
  Box,
  Button,
  Card,
  IconButton,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Input,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/joy'

import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

import EmptyState from '../../../sharedProfile/EmptyState.js'
import { usePaymentHubUpdate } from '../../../hooks/payments/usePaymentHubUpdate.js'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'
import { AnimatedModal } from '../../../../../ui/patterns/modals/index.js'

const money = value => `${Number(value || 0).toLocaleString('he-IL')} ₪`
const cleanAmount = value => Number(String(value || '').replace(/,/g, ''))


const primaryButtonSx = {
  bgcolor: devPlanColors.primary,
  color: '#FFFFFF',
  '&:hover': { bgcolor: devPlanColors.primaryDark },
  '&:disabled': {
    bgcolor: devPlanColors.primaryLight,
    color: devPlanColors.secondary,
  },
}

const secondaryButtonSx = {
  color: devPlanColors.primary,
  borderColor: devPlanColors.primary,
  '&:hover': {
    bgcolor: devPlanColors.primaryLight,
    borderColor: devPlanColors.primaryDark,
  },
}

function statusMeta(payment) {
  if (payment?.agreementStatus === 'closed') return { label: 'נסגר', color: 'success' }
  if (payment?.agreementStatus === 'partial') return { label: 'שולם חלקית', color: 'warning' }
  return { label: 'לא שולם', color: 'neutral' }
}

function AgreementCard({ payment }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [paidAt, setPaidAt] = useState(moment().format('YYYY-MM-DD'))
  const [error, setError] = useState('')
  const [agreementOpen, setAgreementOpen] = useState(false)
  const [totalAmount, setTotalAmount] = useState('')
  const [agreementError, setAgreementError] = useState('')
  const [editingInstallment, setEditingInstallment] = useState(null)
  const [deleteInstallment, setDeleteInstallment] = useState(null)
  const { run, pending } = usePaymentHubUpdate(payment)

  const installments = Array.isArray(payment?.installments) ? payment.installments : []
  const closed = payment?.agreementStatus === 'closed'
  const progress = payment?.totalAmount > 0
    ? Math.min(100, (payment.paidAmount / payment.totalAmount) * 100)
    : 0
  const status = statusMeta(payment)
  const endDate = payment?.startDate && payment?.durationMonths
    ? moment(payment.startDate).add(payment.durationMonths, 'months').format('DD/MM/YYYY')
    : ''


  const resetForm = () => {
    setAmount('')
    setPaidAt(moment().format('YYYY-MM-DD'))
    setError('')
    setEditingInstallment(null)
  }

  const openAdd = () => {
    resetForm()
    setOpen(true)
  }

  const openEdit = item => {
    setEditingInstallment(item)
    setAmount(String(item?.amount || ''))
    setPaidAt(item?.paidAt || moment().format('YYYY-MM-DD'))
    setError('')
    setOpen(true)
  }

  const openAgreementEdit = () => {
    setTotalAmount(String(payment?.totalAmount ?? payment?.price ?? ''))
    setAgreementError('')
    setAgreementOpen(true)
  }

  const handleSaveAgreement = async () => {
    const numericTotal = cleanAmount(totalAmount)
    const paidAmount = Number(payment?.paidAmount || 0)

    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      setAgreementError('יש להזין סכום כולל תקין')
      return
    }

    if (numericTotal < paidAmount) {
      setAgreementError(`הסכום הכולל לא יכול להיות נמוך מהסכום שכבר שולם: ${money(paidAmount)}`)
      return
    }

    const result = await run('privatePaymentAgreementUpdate', {
      totalAmount: numericTotal,
      price: numericTotal,
    }, {
      section: 'privatePaymentAgreementUpdate',
      paymentId: payment.id,
      createIfMissing: false,
    })

    if (result?.ok === false) return
    setAgreementOpen(false)
  }

  const handleSaveInstallment = async () => {
    const numericAmount = cleanAmount(amount)
    const currentAmount = Number(editingInstallment?.amount || 0)
    const availableAmount = Number(payment.remainingAmount || 0) + currentAmount

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('יש להזין סכום תקין')
      return
    }

    if (!paidAt) {
      setError('יש לבחור תאריך תשלום')
      return
    }

    if (numericAmount > availableAmount) {
      setError(`הסכום גבוה מהיתרה הזמינה: ${money(availableAmount)}`)
      return
    }

    const nextInstallments = editingInstallment
      ? installments.map(item => item.id === editingInstallment.id
        ? { ...item, amount: numericAmount, paidAt, updatedAt: Date.now() }
        : item)
      : [
          ...installments,
          {
            id: `${Date.now()}`,
            amount: numericAmount,
            paidAt,
            createdAt: Date.now(),
          },
        ]

    const result = await run(
      editingInstallment ? 'privatePaymentInstallmentUpdate' : 'privatePaymentInstallmentAdd',
      { installments: nextInstallments },
      {
        section: editingInstallment ? 'privatePaymentInstallmentUpdate' : 'privatePaymentInstallmentAdd',
        paymentId: payment.id,
        createIfMissing: false,
      }
    )

    if (result?.ok === false) return

    resetForm()
    setOpen(false)
  }

  const handleDeleteInstallment = async () => {
    if (!deleteInstallment?.id) return

    const nextInstallments = installments.filter(item => item.id !== deleteInstallment.id)
    const result = await run('privatePaymentInstallmentDelete', {
      installments: nextInstallments,
    }, {
      section: 'privatePaymentInstallmentDelete',
      paymentId: payment.id,
      createIfMissing: false,
    })

    if (result?.ok === false) return
    setDeleteInstallment(null)
  }


  return (
    <Card variant="outlined" sx={{ p: 2, gap: 1.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
        <Box>
          <Typography level="title-md">תשלום פרטי</Typography>
          <Typography level="body-xs" textColor="text.tertiary">
            התחלה: {payment.startDate ? moment(payment.startDate).format('DD/MM/YYYY') : '—'}
            {endDate ? ` · סיום: ${endDate}` : ''}
          </Typography>
        </Box>
        <Chip size="sm" color={status.color} variant="soft">{status.label}</Chip>
      </Stack>

      <Divider />

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} justifyContent="space-between">
        <Box>
          <Typography level="body-xs" textColor="text.tertiary">סכום כולל</Typography>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography level="title-lg">{money(payment.totalAmount)}</Typography>
            <IconButton size="sm" variant="plain" onClick={openAgreementEdit}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        <Box>
          <Typography level="body-xs" textColor="text.tertiary">סה״כ שולם</Typography>
          <Typography level="title-lg">{money(payment.paidAmount)}</Typography>
        </Box>
        <Box>
          <Typography level="body-xs" textColor="text.tertiary">נותר לתשלום</Typography>
          <Typography level="title-lg">{money(payment.remainingAmount)}</Typography>
        </Box>
      </Stack>

      <LinearProgress determinate value={progress} sx={{ '--LinearProgress-thickness': '8px' }} />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography level="title-sm">פעימות תשלום</Typography>
          <Typography level="body-xs" textColor="text.tertiary">{installments.length} פעימות</Typography>
        </Stack>

        {installments.length === 0 ? (
          <Typography level="body-sm" textColor="text.tertiary">טרם הוזנו פעימות תשלום.</Typography>
        ) : (
          <Stack gap={0.75}>
            {installments.map((item, index) => (
              <Stack
                key={item.id || `${payment.id}-${index}`}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Typography level="body-sm">פעימה {index + 1}</Typography>
                <Typography level="body-sm">{item.paidAt ? moment(item.paidAt).format('DD/MM/YYYY') : '—'}</Typography>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Typography level="title-sm">{money(item.amount)}</Typography>
                  <>
                    <IconButton size="sm" variant="plain" onClick={() => openEdit(item)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="sm" variant="plain" color="danger" onClick={() => setDeleteInstallment(item)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Box>

      <Button
        size="sm"
        variant="solid"
        disabled={closed}
        onClick={openAdd}
        sx={{ ...primaryButtonSx, alignSelf: 'flex-start' }}
      >
        {closed ? 'התשלום נסגר' : 'הוספת פעימה'}
      </Button>

      <AnimatedModal
        open={open}
        size="sm"
        busy={pending}
        disabled={!amount || !paidAt}
        persistent={pending}
        title={editingInstallment ? 'עריכת פעימת תשלום' : 'הוספת פעימת תשלום'}
        description={`יתרה זמינה: ${money(Number(payment.remainingAmount || 0) + Number(editingInstallment?.amount || 0))}`}
        iconId="payments"
        confirmLabel={editingInstallment ? 'שמירת שינויים' : 'שמירת פעימה'}
        confirmIconId="save"
        cancelLabel="ביטול"
        onConfirm={handleSaveInstallment}
        onClose={() => {
          if (pending) return
          resetForm()
          setOpen(false)
        }}
      >
        <Stack gap={1.5}>
          <FormControl required error={Boolean(error)}>
            <FormLabel>סכום ששולם</FormLabel>
            <Input
              type="number"
              value={amount}
              onChange={event => {
                setAmount(event.target.value)
                setError('')
              }}
              slotProps={{ input: { min: 1, max: Number(payment.remainingAmount || 0) + Number(editingInstallment?.amount || 0) } }}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>תאריך תשלום</FormLabel>
            <Input type="date" value={paidAt} onChange={event => setPaidAt(event.target.value)} />
          </FormControl>

          {error ? <Typography level="body-xs" color="danger">{error}</Typography> : null}
        </Stack>
      </AnimatedModal>

      <AnimatedModal
        open={agreementOpen}
        size="sm"
        busy={pending}
        disabled={!totalAmount}
        persistent={pending}
        title="עריכת סכום ההתקשרות"
        description={`שולם עד כה: ${money(payment.paidAmount)}`}
        iconId="payments"
        confirmLabel="שמירת סכום"
        confirmIconId="save"
        cancelLabel="ביטול"
        onConfirm={handleSaveAgreement}
        onClose={() => {
          if (pending) return
          setAgreementError('')
          setAgreementOpen(false)
        }}
      >
        <FormControl required error={Boolean(agreementError)}>
          <FormLabel>סכום כולל</FormLabel>
          <Input
            type="number"
            value={totalAmount}
            onChange={event => {
              setTotalAmount(event.target.value)
              setAgreementError('')
            }}
            slotProps={{ input: { min: Number(payment.paidAmount || 0) } }}
          />
          {agreementError ? <Typography level="body-xs" color="danger">{agreementError}</Typography> : null}
        </FormControl>
      </AnimatedModal>

      <AnimatedModal
        open={Boolean(deleteInstallment)}
        size="sm"
        busy={pending}
        persistent={pending}
        title="מחיקת פעימת תשלום"
        description={`למחוק את הפעימה בסך ${money(deleteInstallment?.amount)}? החישובים יעודכנו אוטומטית.`}
        iconId="delete"
        confirmLabel="מחיקה"
        confirmIconId="delete"
        cancelLabel="ביטול"
        onConfirm={handleDeleteInstallment}
        onClose={() => {
          if (pending) return
          setDeleteInstallment(null)
        }}
      />
    </Card>
  )
}

export default function PrivatePlayerPaymentsView({ items = [] }) {
  const agreements = useMemo(() => {
    return items
      .filter(item => item?.typeId === 'privateAgreement')
      .sort((a, b) => String(b?.startDate || '').localeCompare(String(a?.startDate || '')))
  }, [items])

  if (agreements.length === 0) {
    return <EmptyState title="אין תשלום פתוח" desc="יש לפתוח תשלום חדש ולהגדיר סכום כולל ותאריך התחלה." />
  }

  return (
    <Stack gap={2}>
      {agreements.map(payment => <AgreementCard key={payment.id} payment={payment} />)}
    </Stack>
  )
}
