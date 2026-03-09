
export function formatPhoneNumber(phone, space = '\u200A') {
  if (!phone) return '';
  const clean = String(phone).replace(/\D/g, '');
  const part1 = clean.slice(0, 3);
  const part2 = clean.slice(3);
  const base = `${part2} - ${part1}`;
  // מוסיף רווח קטן אחרי כל ספרה שמיד אחריה יש ספרה
  return base.replace(/\d(?=\d)/g, `$&${space}`);
}
