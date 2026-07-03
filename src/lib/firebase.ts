/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// User's explicit Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNWMx9Dfneos0diCBckhg97tcV2JP0G6U",
  authDomain: "kaivo-a93e6.firebaseapp.com",
  projectId: "kaivo-a93e6",
  storageBucket: "kaivo-a93e6.firebasestorage.app",
  messagingSenderId: "231629740707",
  appId: "1:231629740707:web:56640530ded596aff83d16",
  measurementId: "G-CQW5EEDVWL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
