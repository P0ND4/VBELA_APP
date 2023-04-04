import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgUP37kEE8mxBcsoF-U5PqRRK_p5SWyNU",
  authDomain: "vbelasofia-d6d07.firebaseapp.com",
  projectId: "vbelasofia-d6d07",
  storageBucket: "vbelasofia-d6d07.appspot.com",
  messagingSenderId: "1087185260789",
  appId: "1:1087185260789:web:6f05c30b724c0c9f1c75bc"
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);


export { database };