import admin from 'firebase-admin';
import UnauthorizeError from '../response/errors/UnauthorizeError.js';
import ForbiddenError from '../response/errors/ForbiddenError.js';

const verifyToken = {
  verify: async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      throw new UnauthorizeError('Unauthorized!');
    }
  },
  verifyAdminOrLecturer: async (req, res, next) => {
    await verifyToken.verify(req, res, () => {
      const user = req.user;

      if (!user) {
        throw new UnauthorizeError('Unauthorized!');
      }

      if (user.role !== 'ADMIN' && user.role !== 'LECTURER') {
        throw new ForbiddenError('Forbidden!');
      }

      next();
    });
  },
  verifyAdmin: async (req, res, next) => {
    await verifyToken.verify(req, res, () => {
      const user = req.user;

      if (!user) {
        throw new UnauthorizeError('Unauthorized!');
      }

      if (user.role !== 'ADMIN') {
        throw new ForbiddenError('Forbidden!');
      }

      next();
    });
  },
  verifyLecturer: async (req, res, next) => {
    await verifyToken.verify(req, res, () => {
      const user = req.user;

      if (!user) {
        throw new UnauthorizeError('Unauthorized!');
      }

      if (user.role !== 'LECTURER') {
        throw new ForbiddenError('Forbidden!');
      }

      next();
    });
  },
};

export default verifyToken;
