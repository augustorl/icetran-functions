import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import * as firestore from "firebase-admin";
import firebase from "firebase";
import { firebaseConfig } from "./config/firebase";
import { createUser, deleteUser, getUser, getUsers } from "./handlers/users";
const app = require('express')();


// Initialize firebase
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
auth.useEmulator("http://localhost:9099")
admin.initializeApp();
export const db = firestore.firestore();
db.settings({ ignoreUndefinedProperties: true });




// User Routes
app.get('/users', getUsers)
app.get('/user/:id', getUser);
app.post('/user', createUser);
app.delete('/user/:id', deleteUser);

exports.api = functions.https.onRequest(app);