/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

declare const self: ServiceWorkerGlobalScope;

const firebaseConfig = {
  apiKey: "AIzaSyAlm35BY9Fe_ZXpfoR-WAHnNNKEO-UzUwQ",
  authDomain: "linphone-79371.firebaseapp.com",
  projectId: "linphone-79371",
  storageBucket: "linphone-79371.firebasestorage.app",
  messagingSenderId: "1022372695421",
  appId: "1:1022372695421:web:fc2d0d7d647f97b0771014",
  measurementId: "G-WTS2J2XSHX",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("[FCM SW Dedicado] Mensagem de fundo recebida:", payload);

  const notificationTitle = payload.notification?.title || "Nova Mensagem";
  const notificationOptions = {
    body: payload.notification?.body || "Você recebeu uma notificação.",
    icon: "/icons/icon96.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
