importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAgNtP5xoEua6p2A4jq75wNUjPRyn1R0b4',
  authDomain: 'motomoto-435d8.firebaseapp.com',
  projectId: 'motomoto-435d8',
  storageBucket: 'motomoto-435d8.firebasestorage.app',
  messagingSenderId: '991502952338',
  appId: '1:991502952338:web:4dbb15967192fdf290834b',
})

const messaging = firebase.messaging()
// Activa la configuración nueva sin esperar a cerrar todas las pestañas.
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()))
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'MotoMoto Local'
  const options = {
    body: payload.notification?.body || 'Tienes un pedido nuevo',
    icon: '/logo-mark.png', badge: '/icons/icon-192.png',
    data: payload.data || {}, tag: payload.data?.tag || 'motomoto-local',
    silent: false, vibrate: [200, 100, 200], renotify: true,
  }
  return self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const existing = list.find((client) => client.url.startsWith(self.location.origin))
    return existing?.focus ? existing.focus().then(() => existing.navigate?.(url)) : clients.openWindow(url)
  }))
})
