const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// MongoDB Connection
mongoose.connect("mongodb+srv://kumkumjangir22:S9R4c1U3jvVG05KT@cluster0.01b69kq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { useNewUrlParser: true, useUnifiedTopology: true });

// Audio Schema
const audioSchema = new mongoose.Schema({
    filename: String,
    sender: String,
    timestamp: { type: Date, default: Date.now }
});

const Audio = mongoose.model("Audio", audioSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Multer setup for file storage
const storage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        const uniqueName = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Socket.io Handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendVoice", async (audioData) => {
        const fileName = `${uuidv4()}.webm`;
        const filePath = path.join(__dirname, "uploads", fileName);
        fs.writeFileSync(filePath, audioData);

        // Save to MongoDB
        const newAudio = new Audio({ filename: fileName, sender: socket.id });
        await newAudio.save();

        io.emit("receiveVoice", { url: `/uploads/${fileName}`, sender: socket.id });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// API to get saved messages
app.get("/messages", async (req, res) => {
    try {
        const messages = await Audio.find().sort({ timestamp: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Error fetching messages" });
    }
});

// Start Server
server.listen(5000, () => console.log("Server running on port 5000"));
