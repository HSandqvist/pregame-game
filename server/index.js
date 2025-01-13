import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";

let httpServer;
let io;

if (process.env.NODE_ENV === "production") {
  const app = express();
  httpServer = createServer(app);
  io = new Server(httpServer);
  let path = import.meta.dirname.split("/");
  path.pop();
  app.use(express.static(path.join("/") + "/dist/"));
  app.get("*", (req, res) => {
    res.sendFile(path.join("/") + "/dist/index.html");
  });
} else {
  // Create an HTTP server instance
  httpServer = createServer();
  // Initialize a new Socket.io server instance and configure it
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET"],
      credentials: true
    }
  });
}

// Import the Data class to manage server-side data
// This class handles all poll-related data and logic
import { Data } from "./Data.js";

// Import the sockets function, which defines all WebSocket event handlers
import { sockets } from "./sockets.js";

// Instantiate a new Data object to store poll-related data
let data = new Data();

// Handle WebSocket connections
io.on('connection', function (socket) {
  // Pass the io instance, socket connection, and data object to the sockets function
  sockets(this, socket, data);
});

// Define the port number, using an environment variable if available, otherwise default to 3000
const PORT = process.env.PORT || 3000;

// Start the HTTP server and listen on the specified port
httpServer.listen(PORT, function() {
  console.log("Socket.io server running on http://localhost:" + PORT);
});
