import { createServer } from "http";
import { Server } from "socket.io";

// Create an HTTP server instance
const httpServer = createServer();

// Initialize a new Socket.io server instance and configure it
const io = new Server(httpServer, {
  cors: {
    //THIS SHOULD BE CHANGED AFTER DEVLPOMENT
    origin: "*", // Allow requests from the specified frontend origin
    methods: ["GET"], // Specify allowed HTTP methods
    credentials: true // Enable sending credentials (e.g., cookies) with cross-origin requests
  }
});

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
