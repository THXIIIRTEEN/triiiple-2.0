import express from 'express';
import { createNewChatRoom, createNewMessageWithFiles, getMessagesFromChatRoom, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles } from '../middlewares/chat';

const chatRouter = express.Router();

chatRouter.post('/create-chat', createNewChatRoom);
chatRouter.post('/get-messages', getMessagesFromChatRoom);
chatRouter.post('/send-file', createNewMessageWithFiles, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles)

export default chatRouter;
