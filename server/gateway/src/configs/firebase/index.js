import admin from "firebase-admin";
import serviceAccount from "../../../firebase.json" assert { type: "json" };
import { _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";

const firebaseInit = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log(`${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | Firebase admin initialized`);
  } catch (error) {
    sendLogTelegram("FIREBASE::INIT" + err);
  }
};

export { firebaseInit };
