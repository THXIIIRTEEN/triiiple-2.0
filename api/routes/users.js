const userRouter = require('express').Router();

const { createNewUser, sendEmailConfirmation, checkAuthorizedUser, sendEmailConfirmationAuthorization, verifyCode } = require('../middlewares/users')

userRouter.post('/users/registration', createNewUser, sendEmailConfirmation);
userRouter.post('/users/login', checkAuthorizedUser, sendEmailConfirmationAuthorization);
userRouter.post('/users/verification', verifyCode);

module.exports = {
    userRouter
}