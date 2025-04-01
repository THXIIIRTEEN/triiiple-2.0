import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { IMessageSchema } from "../database/schemes/message";
import { IFileSchema } from "../database/schemes/file";
import { IPostSchema } from "../database/schemes/posts";

export interface CustomRequest extends Request {
    fileUrl?: string;
    fileUrlArray?: IFileSchema[];
    userId?: string;
    auth?: JwtPayload;
    message?: IMessageSchema | IPostSchema;
    chatId?: string;
}