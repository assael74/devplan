import {
  Payments,
  PublishedWithChanges,
  CurrencyExchange,
  Autorenew,
  VolunteerActivism,
  MonetizationOn,
} from '@mui/icons-material';

export const paymentIcon = {
  payment: <Payments />,
  payments: <Payments />,
  isInvoice: <PublishedWithChanges />,
  isNotPaid: <CurrencyExchange />,
  monthlyPayment: <Autorenew />,
  paymentRequst: <VolunteerActivism />,
  oneTimePayment: <MonetizationOn />,
};
