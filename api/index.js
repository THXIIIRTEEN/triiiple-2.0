const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');
require('dotenv').config();

const connectToDatabase = require('./database/connect');
const cors = require('./middlewares/cors');

const { userRouter } = require('./routes/users')
const { confirmationRouter } = require('./routes/confirmations');
const { passwordRouter } = require('./routes/password');
const captchaRouter = require('./routes/captcha');

connectToDatabase();

app.use(express.static('public'));

app.use(
    cors,
    bodyParser.json(),
    userRouter,
    confirmationRouter,
    captchaRouter,
    passwordRouter
);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
