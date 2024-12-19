import express from 'express';
import { createNewUser, sendEmailConfirmation, checkAuthorizedUser, sendEmailConfirmationAuthorization, verifyCode } from '../middlewares/users';
import { changeUserAvatar, getProfilePicture, uploadAvatar } from '../middlewares/avatar';

const userRouter = express.Router();

userRouter.post('/users/registration', createNewUser, sendEmailConfirmation);
userRouter.post('/users/login', checkAuthorizedUser, sendEmailConfirmationAuthorization);
userRouter.post('/users/verification', verifyCode);
userRouter.post('/avatar/upload', uploadAvatar, changeUserAvatar);
userRouter.post('/avatar', getProfilePicture);
// userRouter.get('/auth/vk', passport.authenticate('vkontakte', {
//     scope: ['friends', 'email'] // Здесь указываются необходимые разрешения
// }));

// userRouter.get('/auth/vk/callback', passport.authenticate('vkontakte', {
//     successRedirect: '/',      // Переадресация после успешной авторизации
//     failureRedirect: '/login', // Переадресация в случае неудачи
// }));

export { userRouter };
