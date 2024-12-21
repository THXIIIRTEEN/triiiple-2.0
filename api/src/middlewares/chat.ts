import { Request, Response } from "express"
import ChatRoom from "../database/schemes/chatRoom"
import User from "../database/schemes/users";
import Message from "../database/schemes/message";

export const createNewChatRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { members } = req.body;

        let chatRoom = new ChatRoom({ members });
        chatRoom = await chatRoom.save();

        const bulkOps = members.map((memberId: string) => ({
            updateOne: {
                filter: { _id: memberId },
                update: { $push: { chatRooms: chatRoom._id } }
            }
        }));

        await User.bulkWrite(bulkOps);
        res.status(200).json({ message: 'Чат создан успешно' });
    }
    catch (error) {
        res.status(400).json({ message: `Произошла ошибка во время создания чата: ${error}`})
    }
};

export const createNewMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { author, chatId, text } = req.body;

        let message = new Message({ author: author, text: text});
        message = await message.save();

        await ChatRoom.findByIdAndUpdate(chatId, {$push: {messages: message}});
        res.status(200).json({ message: `Сообщение отправлено успешно` })
    }
    catch (error) {
        res.status(400).json({ message: `Произошла ошибка при отправке сообщения: ${error}`})
    }
}

export const getMessagesFromChatRoom = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.body;

        const chat = await ChatRoom.findById(chatId)
        .select('messages')
        .populate({
            path: 'messages', 
            populate: {
                path: 'author', 
                select: 'profile username'
            }
        });
        res.status(200).json({ chat })
    }
    catch (error) {
        res.status(400).json({ message: `Произошла ошибка при получении сообщений: ${error}`})
    }
}