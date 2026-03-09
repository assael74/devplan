
export function generateClubId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  return `${slug}-${datePart}-${timePart}`;
}

export function generateTeamId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  return `${slug}-${datePart}-${timePart}`;
}

export function generatePlayerId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  return `${slug}-${datePart}-${timePart}`;
}

export function generatePaymentId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  return `${slug}-${datePart}-${timePart}`;
}

export function generateMeetingId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  return `${slug}-${datePart}`;
}

export function generateGameId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  return `${slug}-${datePart}`;
}

export function generateStatsParmId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  return `${slug}-${datePart}`;
}

export function generateTagParmId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  return `${slug}-${datePart}`;
}

export function generateEvalutionParmId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  return `${slug}-${datePart}`;
}

export function generateRoleId(name) {
  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const timePart = now.toTimeString().slice(0, 8).replace(/:/g, ""); // HHMMSS

  return `${slug}-${datePart}-${timePart}`;
}
