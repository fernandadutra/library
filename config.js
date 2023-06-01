import firebase from "firebase";
const firebaseConfig = {
    apiKey: "AIzaSyCVkUT94qOZiUzpQT9hzRRUooodcqQhO_0",
    authDomain: "library-c346a.firebaseapp.com",
    projectId: "library-c346a",
    storageBucket: "library-c346a.appspot.com",
    messagingSenderId: "917589460723",
    appId: "1:917589460723:web:e39366abaa2b09f3089986"
  };
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();