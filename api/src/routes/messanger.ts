import express from 'express';
import { getUserChatRooms } from '../middlewares/messanger';

const messangerRouter = express.Router();

messangerRouter.post('/messanger', getUserChatRooms);

export default messangerRouter;
