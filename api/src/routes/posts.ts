import express from 'express';
import { addFilesToComment, createNewCommentWithFiles, fetchComments, handleGetPosts, sendCommentWithFiles, uploadCommentFilesToCloud } from '../middlewares/posts';
import { createNewMessageWithFiles, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles } from '../middlewares/posts';


const postRouter = express.Router();

postRouter.post('/get-posts', handleGetPosts);
postRouter.post('/get-comments', fetchComments);
postRouter.post('/send-file-News', createNewMessageWithFiles, uploadMessageFilesToCloud, addFilesToMessage, sendMessageWithFiles);
postRouter.post('/send-file-Comment', createNewCommentWithFiles, uploadCommentFilesToCloud, addFilesToComment, sendCommentWithFiles);

export default postRouter;
