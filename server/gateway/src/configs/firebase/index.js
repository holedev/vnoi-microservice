import admin from "firebase-admin";
import serviceAccount from "../../../firebase.json" assert { type: "json" };
import { InternalServerError } from "../../api/responses/errors/InternalServerError.js";
import { _PROCESS_ENV } from "../env/index.js";

const firebaseInit = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | Firebase admin initialized`);
  } catch (error) {
    throw new InternalServerError("Firebase admin initialization failed!");
  }
};

export { firebaseInit };
