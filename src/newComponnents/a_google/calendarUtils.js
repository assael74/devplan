// 📁 src/g_actions/calendarUtils.js
import { CLIENT_ID, SCOPES } from './gogConfig';

function getHourPlusOne(hourStr = '14:00') {
  const [h, m] = hourStr.split(':').map(Number);
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function createEventInGoogleCalendar(data) {
  return new Promise((resolve, reject) => {
    if (!window.google) return reject('Google API לא זמין');

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (!tokenResponse?.access_token) return reject('לא התקבל טוקן');

        if (!data?.meetingDate || !data?.meetingHour) {
          console.error('❌ חסר תאריך או שעה לפגישה', data);
          return reject('נתוני פגישה לא תקינים');
        }

        const start = `${data.meetingDate}T${data.meetingHour}:00+03:00`;
        const end = `${data.meetingDate}T${getHourPlusOne(data.meetingHour)}:00+03:00`;
        const playerName = data.playerName || 'שחקן';

        const event = {
          summary: `פגישה עם ${playerName}`,
          description: `סוג: ${data.type || ''} \nוידאו: ${data.videoLink || 'ללא'}`,
          start: { dateTime: start, timeZone: 'Asia/Jerusalem' },
          end: { dateTime: end, timeZone: 'Asia/Jerusalem' },
          colorId: '11',
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 60 },
              { method: 'email', minutes: 1440 },
            ],
          },
        };

        console.log("📤 Sending event to Google Calendar:", event);

        try {
          const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
          });

          const json = await res.json();
          if (json?.htmlLink && json?.id) {
            console.log('📅 אירוע נוצר:', json.htmlLink);
            resolve({ eventId: json.id, link: json.htmlLink });
          } else {
            console.error('❌ תגובת שגיאה מ־Google:', json);
            reject(json);
          }
        } catch (error) {
          console.error('❌ שגיאת fetch:', error);
          reject(error);
        }
      },
    });

    tokenClient.requestAccessToken();
  });
}

export async function updateEventInGoogleCalendar(eventId, data) {
  return new Promise((resolve, reject) => {
    if (!window.google) return reject('Google API לא זמין');
    //console.log(data)
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (!tokenResponse?.access_token) return reject('לא התקבל טוקן');

        if (!eventId || !data?.meetingDate || !data?.meetingHour) {
          console.error('❌ חסרים פרטי עדכון', { eventId, data });
          return reject('פרטים חסרים לעדכון');
        }

        const start = `${data.meetingDate}T${data.meetingHour}:00+03:00`;
        const end = `${data.meetingDate}T${getHourPlusOne(data.meetingHour)}:00+03:00`;
        const playerName = data.playerName || 'שחקן';

        const updatedEvent = {
          summary: `פגישה עם ${playerName}`,
          description: `סוג: ${data.type || ''} \nוידאו: ${data.videoLink || 'ללא'}`,
          start: { dateTime: start, timeZone: 'Asia/Jerusalem' },
          end: { dateTime: end, timeZone: 'Asia/Jerusalem' },
          colorId: '11',
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 60 },
              { method: 'email', minutes: 1440 },
            ],
          },
        };

        try {
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedEvent),
          });

          const json = await res.json();
          if (json?.id) {
            console.log('🔁 אירוע עודכן:', json);
            resolve(json);
          } else {
            console.error('❌ שגיאה בעדכון:', json);
            reject(json);
          }
        } catch (error) {
          console.error('❌ שגיאת fetch:', error);
          reject(error);
        }
      },
    });

    tokenClient.requestAccessToken();
  });
}

export async function deleteEventFromGoogleCalendar(eventId) {
  return new Promise((resolve, reject) => {
    if (!window.google) return reject('Google API לא זמין');

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (!tokenResponse?.access_token) return reject('לא התקבל טוקן');

        try {
          const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          });

          if (res.status === 204) {
            console.log('🗑️ אירוע נמחק מהיומן');
            resolve(true);
          } else {
            const errData = await res.json();
            console.error('❌ שגיאה מממשק Google:', errData);
            reject(errData);
          }
        } catch (error) {
          console.error('❌ שגיאת fetch:', error);
          reject(error);
        }
      },
    });

    tokenClient.requestAccessToken();
  });
}
