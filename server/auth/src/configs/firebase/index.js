import admin from "firebase-admin";
import serviceAccount from "../../../firebase.json" assert { type: "json" };
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";

const firebaseInit = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    throw new InternalServerError("Firebase admin initialization failed!");
  }
};

export { firebaseInit };
