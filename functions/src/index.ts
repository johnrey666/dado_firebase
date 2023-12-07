import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();

const corsHandler = cors({origin: true});

export const getAllUsers = functions.https.onRequest((request, response) => {
    return corsHandler(request, response, async () => {
      try {
        const listUsersResult = await admin.auth().listUsers();
        let users: Record<string, unknown>[] = [];      
        listUsersResult.users.forEach((userRecord) => {
          users.push(userRecord.toJSON() as Record<string, unknown>);
        });
        response.send(users);
      } catch (error) {
        console.error('Error fetching users:', error);
        response.status(500).send(error);
      }
    });
  });


