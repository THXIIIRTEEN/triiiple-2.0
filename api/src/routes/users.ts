import express from 'express';
import { handleGetFriends, handleGetFriendsQuantity, createNewUser, sendEmailConfirmation, checkAuthorizedUser, handleGetIdByTag, sendEmailConfirmationAuthorization, verifyCode, handleGetProfile, handleGetRequest, handleEditUserData, fetchUserAboutMe, isEmailVerified, handleVerifyEmail, handleGetUserData, handleGetRequests, handleSearch, handleGetNotifications } from '../middlewares/users';
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
userRouter.post('/fetch-about-user', fetchUserAboutMe);
userRouter.post('/check-verified-email', isEmailVerified);
userRouter.post('/verify-email', handleVerifyEmail);
userRouter.post('/get-user-by-id', handleGetIdByTag);
userRouter.post('/get-friends-quantity', handleGetFriendsQuantity);
userRouter.post('/get-friends', handleGetFriends);
userRouter.post('/get-friend-requests', handleGetRequests);
userRouter.post('/get-user-data', handleGetUserData);
userRouter.post('/search', handleSearch);
userRouter.post('/get-notifications', handleGetUserData);

export { userRouter };
