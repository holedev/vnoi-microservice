import mongoose from "mongoose";
import { _PROCESS_ENV } from "../env/index.js";
import { logging } from "../../../../common/src/logging/index.js";

const _URI = _PROCESS_ENV.NODE_ENV === "dev" ? _PROCESS_ENV.MONGODB_DEV : _PROCESS_ENV.MONGODB_PROD;

const databaseConnection = async () => {
  mongoose
    .connect(_URI)
    .then(() => logging(`Connected to MongoDB ${_PROCESS_ENV.NODE_ENV} | ${mongoose.connections.length} connections`))
    .catch((err) => {
      logging(err);
    });
};

export { databaseConnection };
