import express from 'express';
import { createNewUser, sendEmailConfirmation, checkAuthorizedUser, sendEmailConfirmationAuthorization, verifyCode, handleGetProfile, handleGetRequest, handleEditUserData, fetchUserAboutMe } from '../middlewares/users';
import { changeUserAvatar, getProfilePicture, uploadAvatar } from '../middlewares/avatar';

const userRouter = express.Router();

userRouter.post('/users/registration', createNewUser, sendEmailConfirmation);
userRouter.post('/users/login', checkAuthorizedUser, sendEmailConfirmationAuthorization);
userRouter.post('/users/verification', verifyCode);
userRouter.post('/avatar/upload', uploadAvatar, changeUserAvatar);
userRouter.post('/avatar', getProfilePicture);
userRouter.post('/get-user', handleGetProfile);
userRouter.post('/get-request', handleGetRequest);
userRouter.post('/edit-user-data', handleEditUserData);
userRouter.post('/fetch-about-user', fetchUserAboutMe)


export { userRouter };
