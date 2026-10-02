importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAgNtP5xoEua6p2A4jq75wNUjPRyn1R0b4',
  authDomain: 'motomoto-435d8.firebaseapp.com',
  projectId: 'motomoto-435d8',
  storageBucket: 'motomoto-435d8.firebasestorage.app',
  messagingSenderId: '991502952338',
  appId: '1:991502952338:web:e4f264ad39f463ba90834b',
})

const messaging = firebase.messaging()
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()))
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'MotoMoto Driver'
  const options = {
    body: payload.notification?.body || 'Hay un pedido disponible',
    icon: '/logo-mark.png', badge: '/icons/icon-192.png',
    data: payload.data || {}, tag: payload.data?.tag || 'motomoto-driver',
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
