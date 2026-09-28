import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyCyRN1JJa2Yspbj-V4pQ8JRnfMJLa58KHs",
  authDomain: "bestie-select.firebaseapp.com",
  projectId: "bestie-select",
  storageBucket: "bestie-select.firebasestorage.app",
  messagingSenderId: "663186989880",
  appId: "1:663186989880:web:453ed10d0565a4512957cd",
  measurementId: "G-22PHRQY8VC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);