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
    disabled: boolean,
    password: string,
    uid: string,
}

interface UserAuth {
    email: string,
    password: string,
    phoneNumber: string;
    displayName: string;
    photoURL: string;
    disabled: boolean;
}
type UserInfo = Omit<User, "password">;

export const createUser = async (request: Request, response: Response) => {

    const { email, displayName, bio, idOraculo, photoURL, role, phoneNumber } = request.body.user;

    const claims = {
        phoneNumber,
        displayName,
        photoURL,
        disabled: false,
    }
    const password = "ibrep2021"

    const UserAuthInfo: UserAuth = {
        email,
        password,
        phoneNumber: claims.phoneNumber,
        displayName: claims.displayName,
        photoURL: claims.photoURL,
        disabled: claims.disabled,
    };

    await admin.auth().createUser(UserAuthInfo)
        .then((doc) => {
            admin.auth().setCustomUserClaims(doc.uid, claims);

            const UserInfo: UserInfo =
            {
                email,
                displayName,
                bio,
                idOraculo,
                role,
                phoneNumber,
                emailVerified: false,
                disabled: false,
                photoURL,
                uid: doc.uid,
            };
            const UserCollection = admin.firestore().collection('users');


            UserCollection.doc(`${doc.uid}`).set({
                displayName: UserInfo.displayName,
                email: UserInfo.email,
                bio: UserInfo.bio,
                idOraculo: UserInfo.idOraculo,
                role: UserInfo.role,
                phoneNumber: claims.phoneNumber,
                emailVerified: false,
                disabled: false,
                photoURL: UserInfo.photoURL,
                uid: doc.uid,
            });

            

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

        return response.status(200).json({ message: `User ${UserDocId} deleted` })
    } catch (err) {
        console.error(err);
    };

    return;
};

export const getUser = async (request: Request, response: Response) => {
    const { id } = request.params;

    const user = await admin.auth().getUser(id);

    return response.status(400).json({ user: user });
}

export const getUsers = async (request: Request, response: Response) => {
    try {
        const userList: FirebaseFirestore.DocumentData[] = [];

        const UserCollection = admin.firestore().collection('users');

        const snapshot = await UserCollection.where('active', '==', true).get();
        if (snapshot.empty) {
            console.log('No active users.');
            return;
        }

        snapshot.forEach(doc => {
            console.log(doc.data());
            console.log(doc.id);

            userList.push(doc.data());


        });

        return response.status(200).json(userList);
    } catch (err) {
        console.error(err)
    }

    return;

}

export const updateUser = async (request: Request, response: Response) => {
    try {
        const { id } = request.params;
        const data = request.body.data;

        await admin.auth().updateUser(id, data).then((doc) => {
            admin.auth().setCustomUserClaims(id, data.claims);

            return data;
        }).catch((err) => {
            console.error(err);
        })
    } catch (err) {
        console.error(err);
    }
}
