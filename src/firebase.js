import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA4BTWT1BRt24ntUZk_vu2DRK3NSjJJ-jg",
    authDomain: "expense-tracker-react-b74a8.firebaseapp.com",
    databaseURL: "https://expense-tracker-react-b74a8-default-rtdb.firebaseio.com",
    projectId: "expense-tracker-react-b74a8",
    storageBucket: "expense-tracker-react-b74a8.appspot.com",
    messagingSenderId: "11590435432",
    appId: "1:11590435432:web:b359f2755d3e6d94dd71dd"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const pushAccountData = (accountData) => {
    return push(ref(database, 'accounts'), accountData);
  };
  
  export { app, database, auth, pushAccountData };

