import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import Chat from "./models/ChatSchema";

export default function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const rooms: any = {};
  const userName = "Joseph Melody";

  io.on("connection", (socket) => {
    socket.on("join_room", ({ roomId, userId }) => {
      console.log({ roomId, userId });
      socket.join(roomId);

      if (!rooms[roomId]) {
        rooms[roomId] = []; // Initialize if room does not exist
      }

      // Prevent duplicate users in the room
      if (!rooms[roomId].includes(userId)) {
        rooms[roomId].push(userId);
      }

      console.log("Current room users:", rooms);

      // Notify all users in the room about the online users
      io.to(roomId).emit("online", rooms[roomId]);

      // Handle user disconnect
      socket.on("disconnect", () => {
        console.log(`User ${userId} disconnected from room ${roomId}`);

        // Remove user from room
        rooms[roomId] = rooms[roomId].filter((id: any) => id !== userId);

        // If room is empty, delete it
        if (rooms[roomId].length === 0) {
          delete rooms[roomId];
        }

        console.log("Updated room users after disconnect:", rooms);

        // Notify other users in the room about the disconnection
        io.to(roomId).emit("online", rooms[roomId] || []);
      });
    });

    socket.on("send_message", ({ roomId, sender, message }) => {
      console.log({ roomId, sender, message });

      io.to(roomId).emit("receiveMessage", {
        id: Math.random(),
        userName,
        roomId,
        sender,
        lastMessage: message,
        unreadCount: 2,
        lastActivity: new Date(Date.now() - 1800000),
      });
    });
  });

  return io;
}
