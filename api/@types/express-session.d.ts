declare module 'express-session' {
  import { RequestHandler } from 'express';

  interface SessionData {
    userId: string;
  }

  const session: (options: session.SessionOptions) => RequestHandler;
  export = session;
}
