import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../types/requests";
import Post, { IPostSchema } from "../database/schemes/posts";
import { decryptData, encryptData } from "../utils/crypto";
import multer from "multer";
import { slugify } from "transliteration";
import fs from 'fs';
import { fixEncoding } from "./chat";
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../utils/s3Client";
import { getIO } from "../config/socket";
import mime from 'mime';
import File from "../database/schemes/file";
import User from "../database/schemes/users";
import { IFileSchema } from "../database/schemes/file";
import Comment, { ICommentSchema } from "../database/schemes/comment";
import { IMessageSchema } from "../database/schemes/message";

export const decryptText = async (message: ICommentSchema | IMessageSchema | IPostSchema) => {
    let plaintext = ''; 
    if (message.text) {
        const decrypted = await decryptData(message.text);
        plaintext = decrypted.plaintext;
    }
    return Buffer.from(plaintext, 'base64').toString('utf-8');
}

export const handleGetPosts = async (req: CustomRequest, res: Response) => {
    try {
        const { userId, skip, limit } = req.body; 
        const posts = await Post.find()
            .sort({ date: -1 }) 
            .skip(Number(skip) || 0)
            .limit(Number(limit))
            .populate('author', 'profile username')
            .populate('files')
            .lean();

        if (posts) {
            for (let post of posts as any[]) { 
                if (post.text) {
                    const { plaintext } = await decryptData(post.text);
                    post.text = Buffer.from(plaintext, 'base64').toString('utf-8');
                }
                //@ts-ignore
                post.isLiked = post.likes.map(id => id.toString()).includes(userId);  
                //@ts-ignore
                post.isRead = post.readCount.map(id => id.toString()).includes(userId);
                post.likes = post.likes.length;
                post.readCount = post.readCount.length;              
                post.comments = post.comments.length;
            }
        }
        res.status(200).json({ posts });
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: `Произошла ошибка при получении сообщений: ${error}`})
    }
}

interface INewMessageDataType {
    author: string;
    chatId?: string;
    postId?: string;
    text: string;
}

export const createNewPost = async (msg: INewMessageDataType) => {
    const { author, chatId, text } = msg;

    let ciphertext = ''; 
    if (text) {
        const encrypted = await encryptData(text);
        ciphertext = encrypted.ciphertext;
    }

    let message = new Post({ chatId: chatId, author: author, text: ciphertext });
    message = await message.save();

    await User.findByIdAndUpdate(author, {$push: {posts: message}});
    message.text = await decryptText(message)
    return message.populate({
        path: 'author',
        select: 'profile username'
    });
}

const upload = multer({ dest: 'uploads/' }); 

const checkTotalFileSize = (files: Express.Multer.File[], limit: number) => {
    const totalSize = files.reduce((total, file) => total + file.size, 0); 
    return totalSize <= limit;
};

export const createNewMessageWithFiles = async (req: CustomRequest, res: Response, next: NextFunction) => {
    upload.array('files')(req, res, async (err) => {
        try {
            if (err) {
                throw new Error(err);
            }

            const totalFileSizeLimit = 50 * 1024 * 1024; 
            if (!checkTotalFileSize(req.files as Express.Multer.File[], totalFileSizeLimit)) {
                throw new Error('Cуммарный размер файлов превышает допустимый лимит 50 МБ.');
            }

            const messageData = JSON.parse(req.body.message);

            let ciphertext = ''; 
            if (messageData.text) {
                const encrypted = await encryptData(messageData.text); 
                ciphertext = encrypted.ciphertext;
            }

            let message = new Post({ author: messageData.author, text: ciphertext });
            message = await message.save();
            req.message = message;
            req.userId = messageData.author;

            await User.findByIdAndUpdate(messageData.author, {$push: {posts: message}});
            next();
        } catch (err) {
            console.log(err)
            res.status(400).send(`Ошибка при создании сообщения: ${err}`);
        }
    });
}

export const uploadMessageFilesToCloud = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            throw new Error(`Файл отсутствует`);
        }
        
        const messageData = JSON.parse(req.body.message);

        const uploadPromises = files.map(async (file) => { 
            const fileContent = fs.readFileSync(file.path);

            const fixedName = fixEncoding(file.originalname)

            const params = {
                Bucket: 'triiiple',
                Key: `posts/${messageData.author}/post/${req!.message!._id}/files/${slugify(fixedName)}`, 
                Body: fileContent,
                ContentType: file.mimetype,
            };

            const command = new PutObjectCommand(params); 

            await s3Client.send(command);

            fs.unlinkSync(file.path);

            const url = `https://${params.Bucket}.storage.yandexcloud.net/${params.Key}`;

            let newFile = new File({
                name: slugify(fixedName),
                url: url,
                type: mime.lookup(file.originalname)
            });
            newFile = await newFile.save();

            return newFile;
        });

        const uploadedFileUrls = await Promise.all(uploadPromises);

        req.fileUrlArray = uploadedFileUrls;
        next();
    }

    catch(err) {
        res.status(400).send(`Ошибка при загрузке файла: ${err}`)
    }
};

export const addFilesToMessage = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.message) {
            res.status(400).send("Сообщение не найдено.");
            return;
        }

        if (!req.fileUrlArray || req.fileUrlArray.length === 0) {
            res.status(400).send("URL файлов отсутствуют.");
            return;
        }

        const message = await Post.findByIdAndUpdate(
            req.message._id,
            { $push: { files: { $each: req.fileUrlArray } } }, 
            { new: true } 
        );

        if (!message) {
            res.status(404).send("Сообщение не найдено.");
            return;
        }

        message.text = await decryptText(message)
        req.message = await message.populate ([{
            path: 'author', 
            select: 'profile username'
        },
        {
            path: 'files'
        }
    ]);
        next();
    } 
    
    catch (err) {
        console.error(err)
        res.status(500).send("Ошибка сервера.");
    }
}

export const sendMessageWithFiles = async (req: CustomRequest, res: Response) => {
    try {
        const io = getIO(); 
        if (req.userId) {
            io.to(req.userId).emit('sendPostWithFilesResponse', req.message);
        }
        res.status(200).json({ message: "Сообщение успешно отправлено" });
    } catch (err) {
        res.status(500).send('Ошибка при отправке сообщения');
    }
}

interface IMsgDelete {
    messageId: string,
    userId: string
}

const deleteFile = async (fileUrl: string) => {
    try {
        const url = new URL(fileUrl);
        const bucketName = url.hostname.split('.')[0]; 
        let filePath = decodeURIComponent(url.pathname.substring(1)); 
        filePath = filePath.split('/files')[0];

        const listObjectsCommand = new ListObjectsV2Command({  
            Bucket: bucketName,
            Prefix: filePath,
        });
        const listObjectsResponse = await s3Client.send(listObjectsCommand);
        const objectsToDelete = listObjectsResponse.Contents?.map((obj) => ({
            Key: obj.Key!,
        }));
      
        if (objectsToDelete && objectsToDelete.length > 0) {
            const deleteFolderCommand = new DeleteObjectsCommand({ 
                Bucket: bucketName,
                Delete: {
                Objects: objectsToDelete,
                },
            });
            await s3Client.send(deleteFolderCommand);
        } 
        else {
            console.log(`Папка пуста или не существует`);
            return;
        }
    } catch (err) {
        console.log(`Ошибка при удалении файла: ${err}`);
        return;
    } 
}

export const deletePost = async (msg: IMsgDelete) => {
    const { messageId, userId } = msg;

    const message = await Post.findById(messageId).populate<{ files: IFileSchema[]}>('files'); 

    if (message && message?.files?.length > 0) {
        message.files.forEach(async (file) => {
            deleteFile(file.url);
            await File.findByIdAndDelete(file._id)
        });
    }

    await Post.findByIdAndDelete(messageId);
    await User.findByIdAndUpdate(
        userId,
        { $pull: { messages: messageId } },
        { new: true }
    );
}

interface IMsgEdit {
    messageId: string,
    text: string
}

export const editPost = async (msg: IMsgEdit) => {
    const { messageId, text } = msg;
    
    let ciphertext = ''; 
    if (text) {
        const encrypted = await encryptData(text);
        ciphertext = encrypted.ciphertext;
    }

    await Post.findByIdAndUpdate(
        messageId,
        { text: ciphertext }
    );
};

export const handleLikePost = async (postId: string, userId: string) => {
    try {
        const post = await Post.findByIdAndUpdate(postId);
        //@ts-ignore
        if (post && !post.likes.includes(userId)) {
            const likesCount = await Post.findByIdAndUpdate(postId, { $push: { likes: userId }}, { new: true });
            if (likesCount) {
                return {
                    userId,
                    likesCount: likesCount.likes.length,
                    //@ts-ignore
                    isLiked: likesCount.likes.includes(userId),
                    postId,
                };
            }
        }
        //@ts-ignore
        else if (post && post.likes.includes(userId)) {
            const likesCount = await Post.findByIdAndUpdate(postId, { $pull: { likes: userId }}, { new: true });
            if (likesCount) {
                return {
                    userId,
                    likesCount: likesCount.likes.length,
                    //@ts-ignore
                    isLiked: likesCount.likes.includes(userId),
                    postId,
                };
            }
        }
    }
    catch (error) {
        console.error(error)
    }
}

export const handleAddView = async (postId: string, userId: string) => {
    try {
        const post = await Post.findByIdAndUpdate(postId);
        //@ts-ignore
        if (post && !post.readCount.includes(userId)) {
            console.log(post)
            const readCount = await Post.findByIdAndUpdate(postId, { $push: { readCount: userId }}, { new: true });
            if (readCount) {
                return {
                    userId,
                    readCount: readCount.readCount.length,
                    //@ts-ignore
                    isRead: readCount.readCount.includes(userId),
                    postId,
                };
            }
        }
    }
    catch (error) {
        console.error(error)
    }
}

export const fetchComments = async (req: CustomRequest, res: Response) => {
    try {
        const { postId } = req.body;
        console.log(postId)
        const comments = await Post.findById(postId)
            .select("comments")
            .populate({
                path: "comments",
                populate: [
                    { path: "files" },
                    { path: "author", select: "username profile" }
                ]
            });
        if (!comments) {
            res.status(400).json({ message: "Комментарии не найдены"})
        }
        else if (comments) {
            //@ts-ignore
            for (let comment of comments.comments as any[]) { 
                if (comment.text) {
                    const { plaintext } = await decryptData(comment.text);
                    comment.text = Buffer.from(plaintext, 'base64').toString('utf-8');
                }
            }
            res.status(200).json({ comments: comments.comments })
        }
    }
    catch (error) {
        console.error(error)
    }
}

export const createNewComment = async (msg: INewMessageDataType) => {
    const { author, postId, text } = msg;

    let ciphertext = ''; 
    if (text) {
        const encrypted = await encryptData(text);
        ciphertext = encrypted.ciphertext;
    }
    let message = new Comment({ author: author, text: ciphertext });
    message = await message.save();

    await Post.findByIdAndUpdate(postId, {$push: {comments: message}});
    message.text = await decryptText(message)
    return message.populate({
        path: 'author',
        select: 'profile username'
    });
}

export const createNewCommentWithFiles = async (req: CustomRequest, res: Response, next: NextFunction) => {
    upload.array('files')(req, res, async (err) => {
        try {
            if (err) {
                throw new Error(err);
            }

            const totalFileSizeLimit = 50 * 1024 * 1024; 
            if (!checkTotalFileSize(req.files as Express.Multer.File[], totalFileSizeLimit)) {
                throw new Error('Cуммарный размер файлов превышает допустимый лимит 50 МБ.');
            }

            const messageData = JSON.parse(req.body.message);

            let ciphertext = ''; 
            if (messageData.text) {
                const encrypted = await encryptData(messageData.text); 
                ciphertext = encrypted.ciphertext;
            }
            let message = new Comment({ author: messageData.author, text: ciphertext });
            message = await message.save();
            req.message = message;
            req.userId = messageData.author;

            await Post.findByIdAndUpdate(messageData.postId, {$push: {comments: message}});
            next();
        } catch (err) {
            console.log(err)
            res.status(400).send(`Ошибка при создании сообщения: ${err}`);
        }
    });
}

export const uploadCommentFilesToCloud = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            throw new Error(`Файл отсутствует`);
        }
        
        const messageData = JSON.parse(req.body.message);

        const uploadPromises = files.map(async (file) => { 
            const fileContent = fs.readFileSync(file.path);

            const fixedName = fixEncoding(file.originalname)

            const params = {
                Bucket: 'triiiple',
                Key: `comments/${messageData.author}/comment/${req!.message!._id}/files/${slugify(fixedName)}`, 
                Body: fileContent,
                ContentType: file.mimetype,
            };

            const command = new PutObjectCommand(params); 

            await s3Client.send(command);

            fs.unlinkSync(file.path);

            const url = `https://${params.Bucket}.storage.yandexcloud.net/${params.Key}`;

            let newFile = new File({
                name: slugify(fixedName),
                url: url,
                type: mime.lookup(file.originalname)
            });
            newFile = await newFile.save();

            return newFile;
        });

        const uploadedFileUrls = await Promise.all(uploadPromises);

        req.fileUrlArray = uploadedFileUrls;
        next();
    }

    catch(err) {
        res.status(400).send(`Ошибка при загрузке файла: ${err}`)
    }
};

export const addFilesToComment = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.message) {
            res.status(400).send("Сообщение не найдено.");
            return;
        }

        if (!req.fileUrlArray || req.fileUrlArray.length === 0) {
            res.status(400).send("URL файлов отсутствуют.");
            return;
        }

        const message = await Comment.findByIdAndUpdate(
            req.message._id,
            { $push: { files: { $each: req.fileUrlArray } } }, 
            { new: true } 
        );

        if (!message) {
            res.status(404).send("Сообщение не найдено.");
            return;
        }

        message.text = await decryptText(message)
        req.message = await message.populate ([{
            path: 'author', 
            select: 'profile username'
        },
        {
            path: 'files'
        }
    ]);
        next();
    } 
    
    catch (err) {
        console.error(err)
        res.status(500).send("Ошибка сервера.");
    }
}

export const sendCommentWithFiles = async (req: CustomRequest, res: Response) => {
    try {
        const io = getIO(); 
        if (req.userId) {
            io.to(req.userId).emit('sendCommentWithFilesResponse', req.message);
        }
        res.status(200).json({ message: "Сообщение успешно отправлено" });
    } catch (err) {
        res.status(500).send('Ошибка при отправке сообщения');
    }
}