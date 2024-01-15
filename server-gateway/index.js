import express from 'express';
import cors from 'cors';
import proxy from 'express-http-proxy';
import 'express-async-errors';
import compression from 'compression';
import './src/configs/databases/mongoDB.js';
import './src/configs/firebase/index.js';
import { MY_ENV } from './src/configs/env/index.js';
import { errorHandler } from './src/api/middlewares/ErrorHandler.js';
import { morganMiddleware } from './src/utils/log.js';
import AuthController from './src/api/controllers/auth.js';

const app = express();

const corsOptions = {
  origin:
    MY_ENV.NODE_ENV === 'dev'
      ? ['http://localhost:5173']
      : ['https://vnoi.undefine.tech'],
  credentials: true,
};

app.use(morganMiddleware);

app.use(
  cors(corsOptions),
  express.json(),
  express.urlencoded({ extended: true, limit: '20mb' }),
  compression()
);

// auth proxy
app.use(AuthController.auth);

// user proxy
app.use('/user', proxy('http://localhost:8001'));
// code proxy
app.use('/code', proxy('http://localhost:8002'));
// learning proxy
app.use('/learning', proxy('http://localhost:8003'));

//handle error
app.use(errorHandler);

const PORT = MY_ENV.PORT;

export { app, PORT };
