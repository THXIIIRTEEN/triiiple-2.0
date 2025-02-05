import { Request, Response, NextFunction } from "express"
import ChatRoom from "../database/schemes/chatRoom"
import User from "../database/schemes/users";
import Message from "../database/schemes/message";
import { s3Client } from "../utils/s3Client";
import { ListObjectsV2Command, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import multer from 'multer';
import { CustomRequest } from "../types/requests";
import { getIO } from "../config/socket";
import File from "../database/schemes/file";
import mime from 'mime'
import { IFileSchema } from "../database/schemes/file";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { slugify } from 'transliteration';
import iconv from 'iconv-lite';

const fixEncoding = (text: string): string => {
    return iconv.decode(Buffer.from(text, 'binary'), 'utf-8');
};

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

interface INewMessageDataType {
    author: string;
    chatId: string;
    text: string
}

export const createNewMessage = async (msg: INewMessageDataType) => {
    const { author, chatId, text } = msg;

    let message = new Message({ author: author, text: text});
    message = await message.save();

    await ChatRoom.findByIdAndUpdate(chatId, {$push: {messages: message}});

    return message.populate({
        path: 'author',
        select: 'profile username'
    });
}

export const getMessagesFromChatRoom = async (req: Request, res: Response) => {
    try {
        const { chatId } = req.body;

        const chat = await ChatRoom.findById(chatId)
        .select('messages')
        .populate({
            path: 'messages', 
            populate: [
                {
                    path: 'author', 
                    select: 'profile username'
                },
                {
                    path: 'files'
                }
            ]
        });
        res.status(200).json({ chat });
    }
    catch (error) {
        res.status(400).json({ message: `Произошла ошибка при получении сообщений: ${error}`})
    }
}
interface IMsgDelete {
    messageId: string,
    chatId: string
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
            throw new Error(`Папка пуста или не существует`);
        }
      } catch (err) {
        throw new Error(`Ошибка при удалении файла: ${err}`);
      } 
}

export const deleteMessage = async (msg: IMsgDelete) => {
    const { messageId, chatId } = msg;

    const message = await Message.findById(messageId).populate<{ files: IFileSchema[]}>('files');

    if (message && message?.files?.length > 0) {
        message.files.forEach(async (file) => {
            deleteFile(file.url);
            await File.findByIdAndDelete(file._id)
        });
    }

    await Message.findByIdAndDelete(messageId);
    await ChatRoom.findByIdAndUpdate(
        chatId,
        { $pull: { messages: messageId } },
        { new: true }
    );
}

interface IMsgEdit {
    messageId: string,
    text: string
}

export const editMessage = async (msg: IMsgEdit) => {
    const { messageId, text } = msg;

    await Message.findByIdAndUpdate(
        messageId,
        { text: text, isEdited: true }
    );
};

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

            let message = new Message({
                author: messageData.author,
                text: messageData.text,
            });

            message = await message.save();
            req.message = message;
            req.chatId = messageData.chatId;

            await ChatRoom.findByIdAndUpdate(messageData.chatId, {$push: {messages: message}});

            next();
        } catch (err) {
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
                Key: `chats/${messageData.chatId}/message/${req!.message!._id}/files/${slugify(fixedName)}`,
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

        const message = await Message.findByIdAndUpdate(
            req.message._id,
            { $push: { files: { $each: req.fileUrlArray } } }, 
            { new: true } 
        );

        if (!message) {
            res.status(404).send("Сообщение не найдено.");
            return;
        }

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
        res.status(500).send("Ошибка сервера.");
    }
}

export const sendMessageWithFiles = async (req: CustomRequest, res: Response) => {
    try {
        const io = getIO();
        if (req.chatId) {
            io.to(req.chatId).emit('sendMessageWithFilesResponse', req.message);
        }
        res.status(200).json({ message: "Сообщение успешно отправлено" });
    } catch (err) {
        res.status(500).send('Ошибка при отправке сообщения');
    }
}

export const sendSignedUrl = async (req: CustomRequest, res: Response) => {

    try {
        const fileUrl = req.body.fileUrl

        const url = new URL(fileUrl);
        let filePath = decodeURIComponent(url.pathname.substring(1)); 

        const command = new GetObjectCommand({
            Bucket: 'triiiple',
            Key: filePath,
        });
        //@ts-ignore
        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, 
        });

        res.status(200).send({ signedUrl: signedUrl })
    }
    catch (error) {
        res.status(400).send({ message: `Ошибка получения файла: ${error}`})
    }
}