import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());

const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server is running at localhost:${PORT}`);
})