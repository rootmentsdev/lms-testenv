import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import express from 'express';
import cookieParser from 'cookie-parser';
import connectMongoDB from './db/database.js';
import ModuleRouter from './routes/ModuleRoute.js';
import userrouter from './routes/AssessmentAndModule.js';
import UserCreating from './routes/UserRoute.js';
import UserRouters from './routes/UserConRoute.js';

const app = express();
const port = process.env.PORT || 7000;



app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/', (req, res) => {
    res.send('App is running');
});

app.use('/api', ModuleRouter)
app.use('/api/user', userrouter)
app.use('/api/usercreate', UserCreating)
app.use('/pi/auth', UserRouters)


app.listen(port, () => {
    connectMongoDB()
    console.log(`Server running on port ${port}`);
});

