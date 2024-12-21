import { Request, Response } from "express";
import User from "../database/schemes/users";

export const getUserChatRooms = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;

        const user = await User.findById(userId).select('chatRooms'); 

        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching avatar' });
    }
}