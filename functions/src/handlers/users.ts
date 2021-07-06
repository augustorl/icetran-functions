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
    birthDate: string,
}
type UserAuth = Pick<User, "email" | "password">;
type UserInfo = Omit<User, "password">;

export const createUser = async (request: Request, response: Response) => {

    const { email, displayName, bio, idOraculo, photoURL, role, phoneNumber, birthDate } = request.body.data;

    const formatDate = new Date(birthDate);

    const formattedDate = formatDate.toLocaleDateString('pt-br');

    const password = "ibrep2021"

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
                birthDate: formattedDate,
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
                birthDate: UserInfo.birthDate
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
