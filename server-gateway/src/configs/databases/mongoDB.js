import mongoose from 'mongoose';
import { MY_ENV } from '../env/index.js';

const URI =
  MY_ENV.NODE_ENV === 'dev' ? MY_ENV.MONGODB_DEV : MY_ENV.MONGODB_PROD;

mongoose
  .connect(URI)
  .then(() => console.log(`---> Connected to MongoDB ${MY_ENV.NODE_ENV} <---`))
  .catch((err) => {
    console.log(err);
  });
