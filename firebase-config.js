import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    updateDoc,
    arrayUnion,
    deleteDoc,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyBbOm0_BkxKx1U6Q4vvHEkGwOCSwOyl278",

    authDomain:
        "awh-reals-world.firebaseapp.com",

    projectId:
        "awh-reals-world",

    storageBucket:
        "awh-reals-world.firebasestorage.app",

    messagingSenderId:
        "475657020675",

    appId:
        "1:475657020675:web:ee7f14529edc529dca3536"

};


/* =====================================================
   INITIALIZE FIREBASE
===================================================== */

const app =
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(
        app
    );


const db =
    getFirestore(
        app
    );


/* =====================================================
   EXPORTS
===================================================== */

export {

    app,

    auth,

    db,

    signInWithEmailAndPassword,

    createUserWithEmailAndPassword,

    signInAnonymously,

    onAuthStateChanged,

    doc,

    setDoc,

    getDoc,

    collection,

    addDoc,

    onSnapshot,

    query,

    orderBy,

    serverTimestamp,

    updateDoc,

    arrayUnion,

    deleteDoc,

    runTransaction

};