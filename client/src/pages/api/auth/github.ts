import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.redirect(`${process.env.API_URI}/auth/github`);
}