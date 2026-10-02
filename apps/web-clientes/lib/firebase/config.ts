import { initializeApp, getApps, getApp } from 'firebase/app'

export const firebaseConfig = {
  apiKey: 'AIzaSyAgNtP5xoEua6p2A4jq75wNUjPRyn1R0b4',
  authDomain: 'motomoto-435d8.firebaseapp.com',
  projectId: 'motomoto-435d8',
  storageBucket: 'motomoto-435d8.firebasestorage.app',
  messagingSenderId: '991502952338',
  appId: '1:991502952338:web:3abc69e5d705ec8990834b',
  measurementId: 'G-J5EMNJENT6',
}

// Evitar inicialización múltiple
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

export const vapidKey = 'BIAY8Hs6zZN_7Shcp1RD_oOmA9mt4_qmaEN1lWKRHgdIqZKg3i8U_rZIv1Hw8QyohWlTdNcHivcswbIiE5Q2oBw'
