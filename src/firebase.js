import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAAfxnL4m-qb1F5mAIQLR_VrjLRjYW5wNQ',
  authDomain: 'traineatsleep-repeat.firebaseapp.com',
  projectId: 'traineatsleep-repeat',
  storageBucket: 'traineatsleep-repeat.appspot.com',
  messagingSenderId: '196765430294',
  appId: '1:196765430294:web:c7190991d0f97fa5d2fb37'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
