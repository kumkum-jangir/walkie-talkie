const express = require("express");
const { Server } = require("ws");

const app = express();
const PORT = 8080;

// Create WebSocket Server
const wss = new Server({ port: PORT });

wss.on("connection", (ws) => {
    console.log("A new user connected");

    ws.on("message", (message) => {
        console.log("Received:", message);

        // Broadcast the message to all other clients
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
                client.send(message);
            }
        });
    });

    ws.on("close", () => console.log("User disconnected"));
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
