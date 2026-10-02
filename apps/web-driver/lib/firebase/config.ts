import { getApp, getApps, initializeApp } from 'firebase/app'

export const firebaseConfig = {
  apiKey: 'AIzaSyAgNtP5xoEua6p2A4jq75wNUjPRyn1R0b4',
  authDomain: 'motomoto-435d8.firebaseapp.com',
  projectId: 'motomoto-435d8',
  storageBucket: 'motomoto-435d8.firebasestorage.app',
  messagingSenderId: '991502952338',
  appId: '1:991502952338:web:e4f264ad39f463ba90834b',
  measurementId: 'G-4JY2K1848M',
}

export const app = getApps().some((item) => item.name === 'motomoto-driver')
  ? getApp('motomoto-driver')
  : initializeApp(firebaseConfig, 'motomoto-driver')

export const vapidKey = 'BIAY8Hs6zZN_7Shcp1RD_oOmA9mt4_qmaEN1lWKRHgdIqZKg3i8U_rZIv1Hw8QyohWlTdNcHivcswbIiE5Q2oBw'
