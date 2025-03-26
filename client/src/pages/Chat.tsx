import { useState } from "react";
import { FiSend, FiUser } from "react-icons/fi";
import { BsCheck2All } from "react-icons/bs";

type Message = {
  id: number;
  text: string;
  sender: "user" | "agent";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today?",
      sender: "agent",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
    },
    {
      id: 2,
      text: "I have a question about my bill",
      sender: "user",
      timestamp: new Date(Date.now() - 1800000),
      status: "read",
    },
    {
      id: 3,
      text: "Sure, I can help with that. Could you provide your account number?",
      sender: "agent",
      timestamp: new Date(Date.now() - 1200000),
      status: "read",
    },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages([...messages, message]);
    setNewMessage("");

    // Simulate agent reply after 1-2 seconds
    setTimeout(() => {
      const reply: Message = {
        id: messages.length + 2,
        text: "Thanks for your message. In the next 30sec a staff will get to you, just leave the tab open for sometime...",
        sender: "agent",
        timestamp: new Date(),
        status: "delivered",
      };
      setMessages((prev) => [...prev, reply]);
    }, 1000 + Math.random() * 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>PHED Support</h3>
        <div className="chat-status">Online</div>
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
              <div className="message-text">{message.text}</div>

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
