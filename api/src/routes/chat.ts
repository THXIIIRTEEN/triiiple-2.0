import express from 'express';
import { createNewChatRoom, createNewMessage, getMessagesFromChatRoom } from '../middlewares/chat';

const chatRouter = express.Router();

chatRouter.post('/create-chat', createNewChatRoom);
chatRouter.post('/create-message', createNewMessage);
chatRouter.post('/get-messages', getMessagesFromChatRoom)

export default chatRouter;
