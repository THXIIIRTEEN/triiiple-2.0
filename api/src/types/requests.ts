import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { IMessageSchema } from "../database/schemes/message";
import { IFileSchema } from "../database/schemes/file";
import { IPostSchema } from "../database/schemes/posts";
import { ICommentSchema } from "../database/schemes/comment";

export interface CustomRequest extends Request {
    fileUrl?: string;
    fileUrlArray?: IFileSchema[];
    userId?: string;
    auth?: JwtPayload;
    message?: IMessageSchema | IPostSchema | ICommentSchema;
    chatId?: string;
}