import express from 'express';
import { createNewChatRoom, createNewMessageWithFiles, getMessagesFromChatRoom, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles, sendSignedUrl, getChatMembers, getOnlineStatus, fetchChatData } from '../middlewares/chat';

const chatRouter = express.Router();

chatRouter.post('/create-chat', createNewChatRoom);
chatRouter.post('/get-messages', getMessagesFromChatRoom);
chatRouter.post('/send-file', createNewMessageWithFiles, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles);
chatRouter.post('/get-signed-url', sendSignedUrl);
chatRouter.post('/get-chat-members', getChatMembers);
chatRouter.post('/get-online-status', getOnlineStatus);
chatRouter.post('/get-chat-data', fetchChatData);

export default chatRouter;
