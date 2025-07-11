// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL, StorageReference } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-cJxEQTzIfdNawIMJw040Wi_9xKTweXg",
  authDomain: "faithflow-15535.firebaseapp.com",
  projectId: "faithflow-15535",
  storageBucket: "faithflow-15535.firebasestorage.app",
  messagingSenderId: "531242310940",
  appId: "1:531242310940:web:6f5bd0f73a52cfbbb06ed9",
  measurementId: "G-Y6YQWKMK1D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); 

// Initialize Analytics only if supported (on the client side)
let analytics: any; // Use 'any' or a more specific type if you have it
if (typeof window !== 'undefined') {
  import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      const supported = await isSupported();
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((error) => {
      console.error("Error loading Firebase Analytics:", error);
    });
}
const storage = getStorage(app); // Ensure storage is initialized outside the if block

export { storage, ref, listAll, getDownloadURL };
export type { StorageReference };