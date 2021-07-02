import { Request, Response } from "express";
import * as admin from 'firebase-admin';


interface User {
    bio?: string;
    displayName: string;
    email: string
    emailVerified: false,
    idOraculo: number,
    photoURL?: string,
    role: string,
    phoneNumber: string;
    active: true,
    password: string,
    uid: string,
}
type UserAuth = Pick<User, "email" | "password">;
type UserInfo = Omit<User, "password">;

export const createUser = async (request: Request, response: Response) => {

    const { email, password, displayName, bio, idOraculo, photoURL, role, phoneNumber } = request.body.data;


    const UserAuthInfo: UserAuth = {
        email,
        password,
    };

    await admin.auth().createUser(UserAuthInfo)
        .then((doc) => {

            const UserInfo: UserInfo =
            {
                email,
                displayName,
                bio,
                idOraculo,
                role,
                phoneNumber,
                emailVerified: false,
                active: true,
                photoURL,
                uid: doc.uid,
            };
            const UserCollection = admin.firestore().collection('users');

            UserCollection.doc(`${doc.uid}`).set({
                displayName: UserInfo.displayName,
                email: UserInfo.displayName,
                bio: UserInfo.bio,
                idOraculo: UserInfo.idOraculo,
                role: UserInfo.role,
                phoneNumber: UserInfo.phoneNumber,
                emailVerified: false,
                active: true,
                photoURL: UserInfo.photoURL,
                uid: doc.uid,
            });

            admin.auth().setCustomUserClaims(doc.uid, UserInfo);

            return response.status(201).json({ message: `user: ${UserInfo.displayName} created.` })
        })
        .catch((err: any) => {
            console.error(err);
            if (err.code == 'auth/phone-number-already-exists') {
                return response.status(400).json({ email: 'Phone Number Already Exists' });
            }
            if (err.code == 'auth/email-already-in-use') {
                return response.status(400).json({ email: 'Email is already in use' });
            }
            return response.status(500).json({ error: err });
        })

    return;
};

export const deleteUser = async (request: Request, response: Response) => {
    const UserDocId = request.params.id;
    
    try {

        const UserDoc = admin.firestore().collection('users').doc(`${UserDocId}`);

        UserDoc.update({
            active: false,
        });

        await admin.auth().deleteUser(UserDocId)

        return response.status(200).json({ message: `User ${UserDocId} deleted`})
    } catch (err) {
        console.error(err);
    };

    return;
}
export const updateUser = async (request: Request, response: Response) => {
    const uid = request.params.uid;

    const updatedData = request.body.data;

    try {
        await admin.auth().updateUser(uid, updatedData).then((response) => {
            admin.auth().setCustomUserClaims(uid, updatedData);
        })
    } catch (err) {
        console.error({ error: err.message })
    }

    return;
}

export const getUsers = (request: Request, response: Response) => {
    admin.firestore().collection('users').where("active", "==", true)
        .get()
        .then((data) => {
            let users: { displayName: any; }[] = [];
            data.forEach((doc) => {
                users.push({
                    displayName: doc.data().displayName,
                });
            });
            return response.json(users);
        })
        .catch((err) => {
            console.error(err);
            response.status(500).json({ error: err.code });
        });
}