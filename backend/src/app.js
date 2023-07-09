// General imports
import express from 'express';
import * as dotenv from "dotenv";
import cors from 'cors';
import { connection } from './db.js';

// Router Imports
import userRouter from './routes/userRouter.js';
import commentRouter from './routes/postRouter.js';
import analyticsRouter from './routes/analyticsRouter.js';
import forumRouter from './routes/forumRouter.js';
import { auth } from './middleware/auth.js';

// App setup
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json())
connection.connect(function(error){
	if(error) throw error;
	else console.log('MySQL Database is connected Successfully');
});

app.use('/user', userRouter);
app.use('/post', auth, commentRouter);
app.use('/analytics', auth, analyticsRouter);
app.use('/forum', auth, forumRouter);

// Ping route
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

export default app;