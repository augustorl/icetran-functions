import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import * as firestore from "firebase-admin";
import firebase from "firebase";
import { firebaseConfig } from "./config/firebase";
import { createUser, deleteUser, getUser, getUsers, updateUser } from "./handlers/users";
const cors = require('cors');

const app = require('express')();


// Automatically allow cross-origin requests
app.use(cors({ origin: true }));



// Initialize firebase
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
auth.useEmulator("http://localhost:9099")
admin.initializeApp({
    serviceAccountId: 'firebase-adminsdk-9faid@icetran-vendas-bdcba.iam.gserviceaccount.com',
});
  
export const db = firestore.firestore();
db.settings({ ignoreUndefinedProperties: true });



// User Routes
app.get('/users', getUsers)
app.get('/user/:id', getUser);
app.post('/user', createUser);
app.patch('/user/:id', updateUser);
app.delete('/user/:id', deleteUser);

exports.api = functions.https.onRequest(app);