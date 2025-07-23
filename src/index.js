import dotenv from 'dotenv';
import connectDB from './db/index.js';
dotenv.config({path: './env'});
import { app } from './app.js';

const PORT = process.env.PORT || 3000
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Server running on ' + PORT);
    });
    console.log('Database connection established successfully');
  })
  .catch((error) => {
    console.error('Database connection failed!!', error);
  });

// (async () => {
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         mongoose.connection.on('connected', () => {
//             console.log('Connected to MongoDB');
//         });
//         mongoose.connection.on('error', (err) => {
//             console.error('MongoDB connection error:', err);
//         });
//     }catch (error) {
//         console.error('Error connecting to MongoDB:', error);
//     }
// })();
