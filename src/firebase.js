import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCSnUlsCQIXk0XiLmua1dNiVj-Vag3hxc0",
  authDomain: "baza-ee8e7.firebaseapp.com",
  projectId: "baza-ee8e7",
  storageBucket: "baza-ee8e7.appspot.com",
  messagingSenderId: "656749534532",
  appId: "1:656749534532:web:c24eb1712b7b2944614b11",
  measurementId: "G-HMTKWG50QW",
};

export const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(
  app,
  "https://baza-ee8e7-default-rtdb.europe-west1.firebasedatabase.app"
);
