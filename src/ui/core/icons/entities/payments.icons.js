import {
  Autorenew,
  CurrencyExchange,
  MonetizationOn,
  Payments,
  PublishedWithChanges,
  VolunteerActivism,
  SupervisorAccount
} from '@mui/icons-material';

export const paymentsIcons = {
  isInvoice: <PublishedWithChanges />,
  isNotPaid: <CurrencyExchange />,
  monthlyPayment: <Autorenew />,
  oneTimePayment: <MonetizationOn />,
  payment: <Payments />,
  paymentRequest: <VolunteerActivism />,
  paymentRequst: <VolunteerActivism />,
  payments: <Payments />,
  playerParents: <SupervisorAccount />
};
