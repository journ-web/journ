import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDqLObGIx63U4pyW3ODLrfwnz5K88jBr_4",
  authDomain: "trip-wiser.firebaseapp.com",
  projectId: "trip-wiser",
  storageBucket: "trip-wiser.firebasestorage.app",
  messagingSenderId: "135582493444",
  appId: "1:135582493444:web:333f55080d041f8ffcfe51",
  measurementId: "G-XTNP5SJY9N",
}

// Initialize Firebase
let app
let auth
let db
let analytics = null

// Only initialize Firebase if we're in a browser environment
if (typeof window !== "undefined") {
  try {
    // Initialize Firebase app
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

    // Initialize services after app is initialized
    auth = getAuth(app)
    db = getFirestore(app)
    analytics = getAnalytics(app)

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
} else {
  // Server-side initialization (minimal)
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)
}

export { app, auth, db, analytics }
