import mongoose from "mongoose";
import { _PROCESS_ENV } from "../env/index.js";
import { sendLogTelegram } from "../../utils/telegram.js";

const databaseConnection = async () => {
  mongoose
    .connect(_PROCESS_ENV.MONGODB_URL)
    .then(() =>
      console.log(
        `${_PROCESS_ENV.SERVICE_NAME} ${_PROCESS_ENV.SERVICE_PORT} | Connected to MongoDB ${_PROCESS_ENV.NODE_ENV} -- ${mongoose.connections.length} connections`
      )
    )
    .catch((err) => {
      sendLogTelegram("MONGODB::CREATE\n" + err);
    });
};

export { databaseConnection };
