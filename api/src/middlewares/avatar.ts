import { PutObjectCommand } from "@aws-sdk/client-s3";
import fs from 'fs';
import multer from 'multer';
import { Response, NextFunction } from 'express';
import User from '../database/schemes/users';
import { s3Client } from "../utils/s3Client";
import { CustomRequest } from "../types/requests";

const upload = multer({ dest: 'uploads/' });

export const uploadAvatar = (req: CustomRequest, res: Response, next: NextFunction) => {
    upload.single('file')(req, res, (err) => {
        try {
            if (err) {
                return new Error(err);
            }

            const file = req.file;
            
            if (!file) {
                return new Error(`Файл отсутствует`);
            }

            const fileContent = fs.readFileSync(file.path);
            const userId = req.body.userId;

            const params = {
                Bucket: 'triiiple',
                Key: `profile/${userId}/avatar`,
                Body: fileContent,
                ContentType: file.mimetype,
            };

            const command = new PutObjectCommand(params);

            s3Client.send(command, (err, data) => {
                if (err) {
                    return res.status(500).send(err);
                }
    
                fs.unlinkSync(file.path);
    
                req.fileUrl = `https://${params.Bucket}.storage.yandexcloud.net/${params.Key}`;
                req.userId = userId; 
    
                next();
            });
        }
        catch(err) {
            res.status(400).send(`Ошибка при загрузке файла:${err}`)
        }
    })
}

export const changeUserAvatar = async(req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const fileUrl = req.fileUrl;

    await User.findByIdAndUpdate(userId, {profile: fileUrl});

    res.status(200).send(`Аватар был обновлён успешно`);
}

export const getProfilePicture = async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.body.userId;

        const user = await User.findById(userId).select('profile'); 

        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching avatar' });
    }
};