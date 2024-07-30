import express from "express";
import http from "http";
import cors from "cors";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import validateToken from "./src/middleware/authMiddleware.js";
import ACTIONS from "./src/Actions.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const userSocketMap = {};
const roomFilesMap = {}; // To store files per room

function getAllConnectedClients(roomId) {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        };
    });
}

io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);

        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });

        // Load existing files for the user
        const roomFiles = roomFilesMap[roomId] || [];
        io.to(socket.id).emit('filesLoaded', roomFiles);
    });

    socket.on(ACTIONS.SEND_MESG, (data) => {
        socket.to(data.roomId).emit(ACTIONS.SEND_MESG, data);
        console.log(data);
    });

    socket.on('fileCreated', ({ file }) => {
        try {
            const { roomId } = file;
            if (!roomFilesMap[roomId]) {
                roomFilesMap[roomId] = [];
            }
            roomFilesMap[roomId].push(file);
            console.log('File created:', file);
            io.in(roomId).emit('fileCreated', file);
        } catch (error) {
            console.error('Error handling fileCreated event:', error);
            // Handle error appropriately, such as emitting an error event or logging
        }
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        try {
            socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
        } catch (error) {
            console.error('Error handling CODE_CHANGE event:', error);
            // Handle error appropriately, such as emitting an error event or logging
        }
    });

    socket.on('fileUpdated', ({ file }) => {
        const { roomId, id, content } = file;
        if (roomFilesMap[roomId]) {
            const fileIndex = roomFilesMap[roomId].findIndex((f) => f.id === id);
            if (fileIndex !== -1) {
                roomFilesMap[roomId][fileIndex].content = content;
            }
        }
        io.in(roomId).emit('fileUpdated', file);
    });

    socket.on('fileDeleted', ({ id, roomId }) => {
        if (roomFilesMap[roomId]) {
            roomFilesMap[roomId] = roomFilesMap[roomId].filter((file) => file.id !== id);
        }
        io.in(roomId).emit('fileDeleted', id);
    });

    socket.on('fileRenamed', ({ file }) => {
        const { roomId, id, name } = file;
        if (roomFilesMap[roomId]) {
            const fileIndex = roomFilesMap[roomId].findIndex((f) => f.id === id);
            if (fileIndex !== -1) {
                roomFilesMap[roomId][fileIndex].name = name;
            }
        }
        io.in(roomId).emit('fileRenamed', file);
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
    });

    socket.on('disconnect', () => {
        delete userSocketMap[socket.id];
        console.log('Socket disconnected', socket.id);
    });
});

mongoose.connect('mongodb://localhost:27017/myDevUserDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('Mongodb Connection Error:', error);
});
db.once('open', () => {
    console.log('Database Connected Successfully');
});

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            res.status(400).send({ message: 'User already exists' });
        } else {
            bcrypt.hash(password, 10, async (err, hashedPass) => {
                if (err) {
                    res.status(500).send({ message: 'Error while hashing the password' });
                } else {
                    const user = new User({
                        username: username,
                        email: email,
                        password: hashedPass
                    });
                    await user.save();
                    res.status(201).send({ message: 'Successfully registered' });
                }
            });
        }
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });
        if (!existingUser) {
            res.status(400).json({ error: 'User does not exist, please register' });
        } else {
            bcrypt.compare(password, existingUser.password, (err, result) => {
                if (err) {
                    res.status(500).json({ error: 'Error during login' });
                } else if (result) {
                    const accessToken = jwt.sign({ username: existingUser.username, id: existingUser._id }, 'mySecret', { expiresIn: '1h' });
                    res.json({ accessToken });
                } else {
                    res.status(400).json({ error: 'Incorrect password' });
                }
            });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ message: 'Internal server error' });
    }
});

// Add a dummy /dashboard route to avoid 404 errors
app.get('/dashboard',validateToken, (req, res) => {
    res.send('Dashboard Page');
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

