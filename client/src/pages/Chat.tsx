import { useState, useEffect } from "react";
import { FiSend, FiUser } from "react-icons/fi";
import { BsCheck2All } from "react-icons/bs";
import { io } from "socket.io-client";
import UserNamePrompt from "../components/UserNamePrompt";
import { ClipLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";

const socket = io("https://phed-complaints.onrender.com");

type Message = {
  id: number;
  message: string;
  userName: string;
  roomId: any;
  sender: "user" | "agent";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
};

const roomId = uuidv4();
const userId = uuidv4();

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<number[] | null>(null);
  const [fullname, setFullname] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [loading, SetLoading] = useState<boolean>(false);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);
  let node = 0;

  useEffect(() => {
    socket.emit("join_room", { roomId: roomId, userId });

    const handleReceiveMessage = (data: any) => {
      console.log("Received Data:", data);
      node += 1;

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
            // Play sound only for new incoming messages (from agent)
            if (data.messages.sender === "admin") {
              setPlayNotificationSound(true);
            }
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
      socket.off("online");
    };
  }, []);

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    SetLoading(true);

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

    SetLoading(false);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  console.log(playNotificationSound);

  useEffect(() => {
    if (playNotificationSound === true) {
      const audio = new Audio("/mixkit-liquid-bubble-3000.wav");
      audio.play();
    }

    setPlayNotificationSound(false);
  }, [playNotificationSound]);

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
          disabled={!fullname && loading}
          style={{ cursor: fullname ? "pointer" : "not-allowed" }}
        >
          {!loading ? (
            <FiSend />
          ) : (
            <ClipLoader color="#1d4ed8" loading={true} size={35} />
          )}
        </button>
      </div>
    </div>
  );
}
