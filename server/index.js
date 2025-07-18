import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import connectDB from './config/mongodb.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { codeforces, leetcode, hackerRank } from './model/FeatchCode.js';


import authRouter from './routes/authRoute.js'
import userRouter from './routes/userRouter.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  credentials: true,
  origin: ['https://code-tracker-client.vercel.app', 'http://localhost:5173']
}));
app.use(express.json());
app.use(cookieParser());   
connectDB();



app.get('/', (req, res) =>  res.send('Server Connected'));
app.use('/api/auth',authRouter);
app.use('/user',userRouter);

// Register Codeforces, Leetcode, HackerRank API routes
codeforces(app);
leetcode(app);
hackerRank(app);

// Use modular API routes for resources, problems, and routines

import apiRoutes from './routes/apiRoutes.js';
app.use('/api', apiRoutes);


app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});