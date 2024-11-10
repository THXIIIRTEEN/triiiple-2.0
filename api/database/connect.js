const mongoose = require('mongoose');

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Успешно подключились к MongoDB')
  }
  catch (err) {
    console.log('При подключении MongoDB возникла ошибка')
    console.error(err);
  }
}

module.exports = connectToDatabase;

// mongod --port 27017 --dbpath "C:\data\triiiple-db" Команда для подключения к бд в консоли