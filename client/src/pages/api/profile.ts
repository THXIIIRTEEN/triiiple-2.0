import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const profileAPI = (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    res.status(200).json(decoded);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error });
  }
};

export default profileAPI;
