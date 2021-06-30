import { Request, Response } from "express";
import * as admin from 'firebase-admin';

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

export const createUser = async (request: Request, response: Response) => {

    const { email, password, displayName, bio, idOraculo, photoURL, role } = request.body.data;


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

            if (err.code == 'auth/email-already-in-use') {
                return response.status(400).json({ email: 'Email is already in use' });
            }
            return response.status(500).json({ error: err });
        })

    return;
};

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