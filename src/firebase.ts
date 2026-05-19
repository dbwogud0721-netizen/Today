import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDzyNHMjFOocwvDvkjCn_42d0u-l9XqhZ4',
  authDomain: 'today-haru-a6b52.firebaseapp.com',
  projectId: 'today-haru-a6b52',
  storageBucket: 'today-haru-a6b52.firebasestorage.app',
  messagingSenderId: '803486841634',
  appId: '1:803486841634:web:83a2901c878a53acb8c37b',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
