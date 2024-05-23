const express = require('express')
const http = require('http')
require('dotenv').config()
const cors = require('cors')
const { connectDB } = require('./Utils/db')
const UserRouter = require('./Routes/AuthRoutes')
const SocketServer = require('./SocketServer/Server')

const { Server } = require("socket.io")


async function startServer() {

    const app = express()


    app.use(cors())
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    const PORT = process.env.PORT || 8000;
    const server = http.createServer(app);

    const io = new Server(server, {
        cors: {
            origin: '*',
            methods: ["Get", "Post"],
            allowedHeaders: ["Authorization", "Content-Type"],
            credentials: true
        }
    })
    

    SocketServer(io);

    app.get('/', (req, res, next) => {
        res.status(200).json({ message: "Server Stared" })
    })

    app.use('/auth', UserRouter)

    await connectDB()

    app.use((err, req, res, next) => {
        let status = err.status;
        let message = err.message;
        console.log(err);
        if (!err.status) {
            status = 500;
            message = err.message;
        }
        return res.status(status).json({ message })

    })

    server.listen(PORT, () => {
        console.log("Server Started at PORT ", PORT);
    })
}

startServer()

