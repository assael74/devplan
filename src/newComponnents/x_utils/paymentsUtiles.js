// 📁 x_utils/paymentsUtiles.js

export const optionTypePayment = [
  {id: 'monthlyPayment', lable: 'Monthly Payment', labelH: 'חודשי', idIcon: 'monthlyPayment', disabled: false},
  {id: 'oneTimePayment', lable: 'One-time payment', labelH: 'חד פעמי', idIcon: 'oneTimePayment', disabled: false},
]

export function getStatusPaymentsList(isMobile = false) {
  return [
    {
      id: 'new',
      label: 'New Request',
      labelH: 'ממתין לתשלום',
      idIcon: 'isNotPaid',
      disabled: false,
    },
    {
      id: 'invoice',
      label: 'Wait For Invoice',
      labelH: isMobile ? 'חשבונית' : 'לשלוח\nחשבונית',
      idIcon: 'isInvoice',
      disabled: false,
    },
    {
      id: 'done',
      label: 'Payment Close',
      labelH: 'תשלום נסגר',
      idIcon: 'isPaid',
      disabled: false,
    },
  ];
}

export function getPlayersWithOpenPayments(players = [], payments = [], id) {
  if (id === 'partial') {
    return players.reduce((acc, player) => {
      const playerPayments = payments.filter(
        payment => payment.playerId === player.id && payment.status?.id === 'new'
      );

      if (playerPayments.length > 0) {
        acc.push({
          playerId: player.id,
          playerFullName: player.playerFullName,
          openPaymentsCount: playerPayments.length,
          paymentDates: playerPayments.map(p => p.paymentFor),
        });
      }

      return acc;
    }, []);
  } else {
    return players.filter(player =>
      payments.some(payment =>
        payment.playerId === player.id &&
        payment.status?.id === 'new'
      )
    );
  }
}
