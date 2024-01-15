import bcrypt from 'bcrypt';
import admin from 'firebase-admin';
import { MY_ENV } from '../../configs/env/index.js';
import UserModel from '../models/user.js';
import ConflictError from '../response/errors/ConflictError.js';
import ForbiddenError from '../response/errors/ForbiddenError.js';
import { httpStatusCodes } from '../response/httpStatusCodes/index.js';

const emailWhiteList = ['phanleho002@gmail.com'];

function isAllowed(email) {
  if (MY_ENV.NODE_ENV === 'dev') return true;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@ou\.edu\.vn$/;
  return emailWhiteList.includes(email) || emailPattern.test(email);
}

const AuthController = {
  auth: async (req, res) => {
    if (!isAllowed(email))
      throw new ForbiddenError('Please use an email of HCMCOU!!!');

    let user = await UserModel.findOne({ email });

    if (user) {
      if (user.isDeleted) throw new ConflictError('User has blocked !!!');

      const userFirebase = await admin.auth().getUser(uid);
      const currentClaims = userFirebase.customClaims;

      if (
        !currentClaims ||
        currentClaims.role?.toString() !== user.role?.toString() ||
        currentClaims._id?.toString() !== user._id?.toString()
      ) {
        await admin
          .auth()
          .setCustomUserClaims(uid, { role: user.role, _id: user._id });
        isUpdate = true;
      }

      if (!user.avatar && avatar) {
        user.avatar = avatar;
        await user.save();
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash('Admin@123', salt);

      user = await UserModel.create({
        email,
        username: email,
        password: hashed,
        avatar,
        fullName,
      });
      await admin
        .auth()
        .setCustomUserClaims(uid, { role: user.role, _id: user._id });
      isUpdate = true;
    }

    const { password, __v, createdAt, updatedAt, ...rest } = user.toObject();

    return res.status(httpStatusCodes.OK).json({
      status: 'success',
      data: {
        ...rest,
        isUpdate,
      },
    });
  },
};

export default AuthController;
