import { useState, useEffect } from "react";
import { FiSend, FiUser } from "react-icons/fi";
import { BsCheck2All } from "react-icons/bs";
import { io } from "socket.io-client";
import UserNamePrompt from "../components/UserNamePrompt";
import { toast } from "react-toastify";

const socket = io("http://localhost:5040");

type Message = {
  id: number;
  message: string;
  userName: string;
  roomId: number;
  sender: "user" | "agent";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
};

const roomId = 123456;
const userId = 654321;

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<number[] | null>(null);
  const [fullname, setFullname] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    socket.emit("join_room", { roomId, userId });

    const handleReceiveMessage = (data: any) => {
      console.log("Received Data:", data);

      if (Array.isArray(data)) {
        const formattedMessages = data.map((item) => ({
          id: item.messages.id,
          roomId: item.roomId,
          message: item.messages.text,
          sender: item.messages.sender === "admin" ? "agent" : "user",
          timestamp: new Date(item.lastActivity),
          status: item.messages.status,
        }));

        setMessages((prev) => [...prev, ...formattedMessages]);
      } else {
        setMessages((prev) => {
          if (!prev.some((msg) => msg.id === data.messages.id)) {
            return [
              ...prev,
              {
                id: data.messages.id,
                roomId: data.roomId,
                message: data.messages.text,
                sender: data.messages.sender === "admin" ? "agent" : "user",
                timestamp: new Date(data.lastActivity),
                status: data.messages.status,
              },
            ];
          }
          return prev;
        });
      }
    };

    socket.on("online", (data) => {
      console.log("Online Users:", data);
      setOnlineUsers(data);
    });

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("online"); // Optional: Remove 'online' listener as well
    };
  }, []);

  console.log(messages);

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: messages.length + 1,
      roomId: roomId,
      userName: userName,
      message: newMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    await socket.emit("send_message", message);

    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>PHED Support</h3>
        <div className="chat-status">
          {onlineUsers?.includes(132435) ? "Online" : "Offline"}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${
              message.sender === "user" ? "user" : "agent"
            }`}
          >
            <div className="message-avatar">
              {message.sender === "agent" ? (
                <div className="agent-avatar">A</div>
              ) : (
                <FiUser className="user-avatar" />
              )}
            </div>

            <div className="message-content">
              <div className="message-text">{message.message}</div>

              <div className="message-meta">
                <span className="message-time">{formatTime(new Date())}</span>

                {message.sender === "user" && (
                  <span className={`message-status ${message.status}`}>
                    <BsCheck2All />
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!fullname && (
        <UserNamePrompt
          userName={userName}
          setUserName={setUserName}
          fullname={setFullname}
        />
      )}

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && fullname && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!fullname}
          style={{ cursor: fullname ? "pointer" : "not-allowed" }}
        >
          <FiSend />
        </button>
      </div>
    </div>
  );
}
