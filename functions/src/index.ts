import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import * as firestore from "firebase-admin";
import { Request, Response } from "express";
import firebase from "firebase";
import { firebaseConfig } from "./config/firebase";

firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();
auth.useEmulator("http://localhost:9099")


const app = require('express')();

admin.initializeApp();


const db = firestore.firestore();
db.settings({ ignoreUndefinedProperties: true })

app.get('/users', (request: Request, response: Response) => {
    admin.firestore().collection('users').get()
        .then(data => {
            let users: any = [];

            data.forEach(doc => {
                users.push({
                    userId: doc,
                });
            });

            return response.json(users);
        })
        .catch(err => console.error(err))
});


interface UserRole {
    atendente: string;
    administrador: string;
    parceiro: string;
}
interface User {
    bio?: string;
    displayName: string;
    email: string
    emailVerified: false,
    idOraculo: number,
    photoURL?: string,
    role: UserRole,
    active: true,
    password: string,
}


app.post('/user', async (request: Request, response: Response) => {

    const { email, password, displayName, bio, idOraculo, photoURL, role} = request.body.data;


    const newUser: User = {
        bio,
        displayName,
        email,
        emailVerified: false,
        idOraculo,
        photoURL,
        role,
        password,
        active: true,
    };

    await admin.auth().createUser(newUser)
        .then(() => {
            admin.firestore().collection('users').add(newUser);

            return response.status(201).json({ message: `user: ${newUser} created!` })
        })
        .catch((err: any) => {
            console.error(err);

            if(err.code == 'auth/email-already-in-use') {
                return response.status(400).json({ email: 'Email is already in use'});
            }
            return response.status(500).json({ error: err });
        })


        return;
});

exports.api = functions.https.onRequest(app);