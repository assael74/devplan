// ../PrintablePlayerAbilities.js
import React, { forwardRef } from 'react';

const th = { border: '1px solid #ddd', padding: 8, textAlign: 'right', background: '#f7f7f7' };
const td = { border: '1px solid #ddd', padding: 8, textAlign: 'right' };

export default forwardRef(function PrintablePlayerAbilities({ player, playerAbilities }, ref) {
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

  return (
    <div ref={ref} id="print-root" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: 24 }}>
      {/* כותרת וסיכום */}
      <div className="avoid-break" style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, marginBottom: 8 }}>דוח יכולות שחקן</h2>
        <div><b>שם:</b> {player.playerFullName}</div>
        <div>
          <b>יכולת:</b> {player.level?.toFixed(1)} | <b>פוטנציאל:</b> {player.levelPotential?.toFixed(1)}
        </div>
      </div>

      {playerAbilities.map((domain, idx) => {
        const totalWeight = sum(domain.items, i => (i.value > 0 ? (i.weight ?? 0) : 0));
        const weighted    = sum(domain.items, i => (i.value > 0 ? i.value * (i.weight ?? 0) : 0));
        const domainScore = totalWeight > 0 ? (weighted / totalWeight).toFixed(1) : '-';

        return (
          <div key={domain.domain} className="avoid-break" style={{ marginBottom: 24 }}>
            <h3 style={{ margin: '16px 0 8px' }}>
              {domain.domainLabel} — ציון קטגוריה: {domainScore}
            </h3>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>יכולת</th>
                  <th style={th}>ציון (1–5)</th>
                  <th style={th}>משקל</th>
                </tr>
              </thead>
              <tbody>
                {domain.items.map((i) => (
                  <tr key={i.id}>
                    <td style={td}>{i.label}</td>
                    <td style={td}>{i.value > 0 ? i.value : '-'}</td>
                    <td style={td}>{i.weight ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* אופציונלי: מעבר עמוד */}
            {/* {(idx + 1) % 2 === 0 && <div className="page-break" />} */}
          </div>
        );
      })}
    </div>
  );
});
