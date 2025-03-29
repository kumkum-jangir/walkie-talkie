const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*", // Change this to restrict access
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendVoice", (data) => {
    console.log("Voice Data Received", data);
    socket.broadcast.emit("receiveVoice", data); // Send voice data to all clients except sender
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 8080;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
