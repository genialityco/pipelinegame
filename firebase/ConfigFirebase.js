// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyADzvQg69qrGAdzs9nwTfPEaOnaem2CCqo",
    authDomain: "protoconectados.firebaseapp.com",
    databaseURL: "https://protoconectados-default-rtdb.firebaseio.com",
    projectId: "protoconectados",
    storageBucket: "protoconectados.appspot.com",
    messagingSenderId: "227070954582",
    appId: "1:227070954582:web:42f595fc14475c8de5fff7"
  };
  
// Initialize Firebase
let FirebaseApp = initializeApp(firebaseConfig)
export const FirebaseAppExt = FirebaseApp;
export const storageApp = getStorage(FirebaseApp);
export const FirebaseDB = getFirestore(FirebaseApp);
export const FBRealTime = getDatabase(FirebaseApp);
export const FBAuth = getAuth();
 