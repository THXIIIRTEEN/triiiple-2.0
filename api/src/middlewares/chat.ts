import { Request, Response, NextFunction } from "express"
import ChatRoom from "../database/schemes/chatRoom"
import User from "../database/schemes/users";
import Message, { IMessageSchema } from "../database/schemes/message";
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
import { decryptData, encryptData } from "../utils/crypto";
import { IUser } from "../types/IUser";
import { decryptText } from "./posts";
import { promises as fsPromises } from 'fs';

export const fixEncoding = (text: string): string => {
    return iconv.decode(Buffer.from(text, 'binary'), 'utf-8');
};

export const createNewChatRoom = async (req: Request, res: Response): Promise<void> => {
    try {
        const { members } = req.body;

        const chatCheck = await ChatRoom.findOne({
            members: { $all: members },
            $expr: { $eq: [{ $size: "$members" }, 2] }
        });

        if (chatCheck) {
            res.status(200).json({ message: chatCheck._id });
            return;
        }

        let chatRoom = new ChatRoom({ members });
        chatRoom = await chatRoom.save();

        const bulkOps = members.map((memberId: string) => ({
            updateOne: {
                filter: { _id: memberId },
                update: { $push: { chatRooms: chatRoom._id } }
            }
        }));

        await User.bulkWrite(bulkOps);

        const io = getIO();
        io.to(members).emit('createChatRoomResponse', chatRoom._id);
        
        res.status(200).json({ message: chatRoom._id });
    }
    catch (error) {
        res.status(400).json({ message: `Произошла ошибка во время создания чата: ${error}`})
    }
};

interface INewMessageDataType {
    author: string;
    chatId: string;
    text: string;
}

export const createNewMessage = async (msg: INewMessageDataType) => {
    const { author, chatId, text } = msg;

    let ciphertext = ''; 
    if (text) {
        const encrypted = await encryptData(text);
        ciphertext = encrypted.ciphertext;
    }

    let message = new Message({ chatId: chatId, author: author, text: ciphertext });
    message = await message.save();

    await ChatRoom.findByIdAndUpdate(chatId, {$push: {messages: message}});
    message.text = await decryptText(message); 
    return message.populate({
        path: 'author',
        select: 'profile username tag'
    });
}

export const getMessagesFromChatRoom = async (req: Request, res: Response) => {
    try {
        const { chatId, skip, limit } = req.body;
        const messages = await Message.find({ chatId: chatId })
            .sort({ date: -1 }) 
            .skip(Number(skip) || 0)
            .limit(Number(limit))
            .populate('author', 'profile username tag')
            .populate('files');
        const chat = await ChatRoom.findById(chatId).select('messages');

        if (!chat) {
            res.status(400).json({ message: 'Чат не найден'});
            return;
        }

        if (messages) {
            await Promise.all(
                messages.map(async (message: any) => {
                if (message.text) {
                    const { plaintext } = await decryptData(message.text);
                    message.text = Buffer.from(plaintext, 'base64').toString('utf-8');
                }
                })
            );
        }
        res.status(200).json({ chat: { ...chat.toObject(), messages } });
    }
    catch (error) {
        console.log(error)
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
            console.log(`Папка пуста или не существует`);
            return;
        }
    } catch (err) {
        console.log(`Ошибка при удалении файла: ${err}`);
        return;
    } 
}

export const deleteMessage = async (msg: IMsgDelete) => {
    const { messageId, chatId } = msg;

    const message = await Message.findById(messageId).populate<{ files: IFileSchema[]}>('files');

    if (message?.files?.length) {
        await Promise.all(message.files.map(async (file) => {
            await deleteFile(file.url);
            await File.findByIdAndDelete(file._id);
        }));
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
    
    let ciphertext = ''; 
    if (text) {
        const encrypted = await encryptData(text);
        ciphertext = encrypted.ciphertext;
    }

    await Message.findByIdAndUpdate(
        messageId,
        { text: ciphertext, isEdited: true }
    );
};

export const setMessageRead = async (msg: IMsgDelete) => {
    const { messageId } = msg;

    await Message.findByIdAndUpdate(
        messageId,
        { isRead: true }
    )
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

            let message = new Message({ author: messageData.author, text: ciphertext, chatId: messageData.chatId });

            message = await message.save();
            req.message = message;
            req.chatId = messageData.chatId;

            await ChatRoom.findByIdAndUpdate(messageData.chatId, {$push: {messages: message}});


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

        message.text = await decryptText(message)
        req.message = await message.populate ([{
            path: 'author', 
            select: 'profile username tag'
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
        if (req.chatId) {
            io.to(req.chatId).emit('sendMessageWithFilesResponse', req.message);
            io.to(req.chatId).emit('addNotReadedMessage', req.message);
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

export const getOnlineStatus = async (req: CustomRequest, res: Response) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({ message: `ID Пользователя не найден`});
            return;
        }
        const user = await User.findById(userId).select('onlineStatus');
        if (!user) {
            res.status(400).json({ message: `Пользователь не найден`});
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(400).json({ message: `Произошла непредвиденная ошибка: ${error}`})
    }
}

export const getChatMembers = async (req: CustomRequest, res: Response) => {
    try {
        const { chatId } = req.body;
        if (!chatId) {
            res.status(400).json({ message: `ID Чата не найден`});
            return;
        }
        const chat = await ChatRoom.findById(chatId).select('members');
        if (!chat) {
            res.status(400).json({ message: `Пользователь не найден`});
            return;
        }
        res.status(200).json({ chat });
    }
    catch (error) {
        res.status(400).json({ message: `Произошла непредвиденная ошибка: ${error}`})
    }
}

export const setUserOnline = async (userId: string, status: string) => {
    if (status === "offline") {
        const setStatus = Date.now();
        const user = await User.findByIdAndUpdate(userId, {onlineStatus: setStatus}, {new: true}).select("onlineStatus");
        return user;
    }
    else if (status === "online") {
        const user = await User.findByIdAndUpdate(userId, {onlineStatus: true}, {new: true}).select("onlineStatus");
        return user;
    }
    else {
        return;
    }
}

interface IExportData {
    friendData: IUser,
    notReadedMessages: number,
    lastMessage: IMessageSchema
}

export const fetchChatData = async (req: CustomRequest, res: Response) => {
    try {
        const { chatId, userId } = req.body;
        const chatData = await ChatRoom.findById(chatId)
        .populate({
            path: 'members',
            select: 'username profile tag'
        })
        .populate({
            path: 'messages',
            options: { sort: { date: -1 }, limit: 1 }
        });

        const chatMessagesOnly = await ChatRoom.findById(chatId)
        .populate({
            path: 'messages',
        });

        let exportData = {} as IExportData;

        if (!chatData) {
            res.status(404).json({ message: "Чат не найден" });
            return;
        }

        if (chatData) {
            if (chatData.members.length === 2) {
                const friendData = chatData.members.find((userData) => {
                    //@ts-ignore
                    return userData._id.toString() !== userId;
                })
                //@ts-ignore
                if (friendData) exportData!.friendData = friendData;
            }
            const notReadedMessages = chatMessagesOnly!.messages.filter((message) => {
                //@ts-ignore
                return message.isRead === false && message.author.toString() !== userId;
            })
            exportData!.notReadedMessages = notReadedMessages.length;
            //@ts-ignore
            exportData!.lastMessage = chatData.messages[0] || null
            if (exportData!.lastMessage) {
                let plaintext = ''; 
                if (exportData!.lastMessage.text) {
                    const decrypted = await decryptData(exportData!.lastMessage.text);
                    plaintext = decrypted.plaintext;
                }
                exportData!.lastMessage.text = Buffer.from(plaintext, 'base64').toString('utf-8');
            }
        }

        if (exportData) {
            res.status(200).json({ chatData: exportData })
        }
    }
    catch (error) {
        res.status(400).json({ message: `Произошла ошибка: ${error}`})
    }
}