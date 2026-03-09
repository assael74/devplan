
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAg0bpW1SO32OYcJcJFCV9trs4f89tKkC8",
  authDomain: "devplan-b4454.firebaseapp.com",
  projectId: "devplan-b4454",
  storageBucket: "devplan-b4454.appspot.com",
  messagingSenderId: "330298199313",
  appId: "1:330298199313:web:764aafdaa0470e790e50b0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'פגישה', { body: body || '' });
});
