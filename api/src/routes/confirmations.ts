import express, { Request, Response } from 'express';
import Confirmations from '../database/schemes/confirmations';
import Users from '../database/schemes/users';

const confirmationRouter = express.Router();

confirmationRouter.get('/verify/:username/:token', async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await Users.findOne({ username: req.params.username });
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

export { confirmationRouter };
