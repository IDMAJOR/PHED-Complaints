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
        if (rooms[roomId]) {
          rooms[roomId] = rooms[roomId].filter((id: any) => id !== userId);
        }

        // If room is empty, delete it
        if (rooms[roomId] && rooms[roomId].length === 0) {
          delete rooms[roomId];
        }

        console.log("Updated room users after disconnect:", rooms);

        // Notify other users in the room about the disconnection
        io.to(roomId).emit("online", rooms[roomId] || []);
      });
    });

    socket.on("send_message", async ({ userName, roomId, sender, message }) => {
      console.log({ userName, roomId, sender, message });

      const chat = new Chat({
        roomId,
        userName,
        messages: {
          id: Date.now(),
          text: message,
          sender,
          status: "sent",
        },
        unreadCount: rooms[roomId]?.size ? rooms[roomId].size - 1 : 0,
        lastActivity: new Date(),
      });

      await chat.save();

      io.to(roomId).emit("receiveMessage", {
        roomId,
        userName,
        messages: {
          id: Date.now(), // More reliable unique ID
          text: message,
          sender,
          status: "sent",
        },
        unreadCount: rooms[roomId] ? rooms[roomId].size - 1 : 0, // Exclude sender from unread count
        lastActivity: new Date(),
      });
    });
  });

  return io;
}
