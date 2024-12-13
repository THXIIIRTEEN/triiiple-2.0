import mongoose from 'mongoose';

async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Успешно подключились к MongoDB');
  } catch (err) {
    console.log('При подключении MongoDB возникла ошибка');
    console.error(err);
  }
}

export default connectToDatabase;

// mongod --port 27017 --dbpath "C:\data\triiiple-db" Команда для подключения к бд в консоли