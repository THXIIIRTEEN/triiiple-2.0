import express from 'express';
import { handleGetPosts } from '../middlewares/posts';
import { createNewMessageWithFiles, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles } from '../middlewares/posts';


const postRouter = express.Router();

postRouter.post('/get-posts', handleGetPosts);
postRouter.post('/send-file-News', createNewMessageWithFiles, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles);

export default postRouter;
