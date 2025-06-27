import express, { Request, Response } from 'express';
import Confirmations from '../database/schemes/confirmations';
import Users from '../database/schemes/users';
import { getIO } from '../config/socket';
import User from '../database/schemes/users';
import { createJWTToken } from '../middlewares/users';
import { IUser } from '../types/IUser';

const confirmationRouter = express.Router();

confirmationRouter.get('/verify/:tag/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await Users.findOne({ tag: req.params.tag });
        if (!user) {
            res.status(400).send("Invalid user");
            return;  
        }

        const token = await Confirmations.findOne({
            token: req.params.token,
        });
        if (!token) {
            res.status(400).send("Invalid token");
            return;  
        }

        await Users.updateOne({ _id: user._id }, { verified: true });
        await Confirmations.findByIdAndDelete(token._id);

        res.status(200).send("Email verified successfully");
    } catch (error) {
        res.status(400).send("An error occurred");
        console.log(error);
    }
});

confirmationRouter.get('/change-email/:tag/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await Users.findOne({ tag: req.params.tag });
        if (!user) {
            res.status(400).send("Invalid user");
            return;  
        }
        const token = await Confirmations.findOne({
            token: req.params.token,
        });
        if (!token) {
            res.status(400).send("Invalid token");
            return;  
        }
        const userNew = await Users.findByIdAndUpdate({ _id: user._id }, { email: token.tempData, verified: false }, { new: true }).select('email');
        const userFull = await Users.findById(user._id);
        await Confirmations.findByIdAndDelete(token._id);
        
        const io = getIO();
        if (user && userFull && userNew) {
            const token = createJWTToken(userFull, req, res);
            io.to(`edit-email-${user._id}`).emit('changeEmailResponse', { userNew, token });
            res.status(200).send("Email changed succesfully");
        };
    } catch (error) {
        res.status(400).send("An error occurred");
        console.log(error);
    }
});

confirmationRouter.get('/change-password/:tag/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await Users.findOne({ tag: req.params.tag });
        if (!user) {
            res.status(400).send("Invalid user");
            return;  
        }
        const token = await Confirmations.findOne({
            token: req.params.token,
        });
        if (!token) {
            res.status(400).send("Invalid token");
            return;  
        }
        const userNew = await Users.findByIdAndUpdate({ _id: user._id }, { password: token.tempData }, { new: true }).select('password');
        const userFull = await Users.findById(user._id);
        await Confirmations.findByIdAndDelete(token._id);
        
        const io = getIO();
        if (user && userFull && userNew) {
            const token = createJWTToken(userFull, req, res);
            io.to(`edit-password-${user._id}`).emit('changePasswordResponse', { userNew, token });
            res.status(200).send("Email changed succesfully");
        };
    } catch (error) {
        res.status(400).send("An error occurred");
        console.log(error);
    }
});

export { confirmationRouter };
