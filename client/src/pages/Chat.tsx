import { useState, useEffect } from "react";
import { FiSend, FiUser } from "react-icons/fi";
import { BsCheck2All } from "react-icons/bs";
import { io } from "socket.io-client";

const socket = io("http://localhost:5040");

type Message = {
  id: number;
  message: string;
  roomId: number;
  sender: "user" | "agent";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
};

const roomId = 123456;
const userId = 654321;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      roomId: roomId,
      message: "Hello! How can I help you today?",
      sender: "agent",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
    },
    {
      id: 2,
      roomId: roomId,
      message: "I have a question about my bill",
      sender: "user",
      timestamp: new Date(Date.now() - 1800000),
      status: "read",
    },
    {
      id: 3,
      roomId: roomId,
      message:
        "Sure, I can help with that. Could you provide your account number?",
      sender: "agent",
      timestamp: new Date(Date.now() - 1200000),
      status: "read",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<number[] | null>(null);

  useEffect(() => {
    socket.emit("join_room", { roomId, userId });

    socket.on("online", (data) => {
      console.log(data);
      setOnlineUsers(data);
    });
  }, [socket]);

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: messages.length + 1,
      roomId: roomId,
      message: newMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    await socket.emit("send_message", message);

    setMessages([...messages, message]);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // const sendMessage = {
  //   roomId: roomId,
  //   sender: "user",
  //   message: newMessage,
  // };
  console.log(onlineUsers);

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
          <div key={message.id} className={`message ${message.sender}`}>
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
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>

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

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>
          <FiSend />
        </button>
      </div>
    </div>
  );
}
