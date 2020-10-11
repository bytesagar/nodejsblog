const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectToDatabase = () => {
  try {
    mongoose.connect(
      process.env.DB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      },
      () => {
        console.log('Database connected successfully');
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectToDatabase;
