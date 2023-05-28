import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const API_KEY = "AIzaSyCgDb8wDmNE8WZMMoIbF9fdZ873uhTpx-c"

const firebaseConfig = {
	apiKey: "AIzaSyCgDb8wDmNE8WZMMoIbF9fdZ873uhTpx-c",
	authDomain: "notes-a7564.firebaseapp.com",
	projectId: "notes-a7564",
	storageBucket: "notes-a7564.appspot.com",
	messagingSenderId: "632155334580",
	appId: "1:632155334580:web:4f1a4ce5aa908d9b1e34e1",
	measurementId: "G-ETH6613HVW"
	  };

const app = initializeApp(firebaseConfig)
export const storage = getStorage(app)
export const db = getFirestore(app)
