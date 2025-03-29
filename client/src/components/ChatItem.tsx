import { Chat } from "../types/types";
import { FiUser } from "react-icons/fi";

interface ChatItemProps {
  chat: Chat;
  selectedChat: number | null;
  setSelectedChat: (id: number) => void;
  formatTime: (date: Date) => string;
}

export default function ChatItem({
  chat,
  selectedChat,
  setSelectedChat,
  formatTime,
}: ChatItemProps) {
  return (
    <div
      key={chat.id}
      className={`chat-item ${selectedChat === chat.id ? "active" : ""}`}
      onClick={() => setSelectedChat(chat.id)}
    >
      <div className="chat-info">
        <div className="chat-header">
          <div className="profile">
            <div className="chat-avatar">
              <FiUser />
            </div>
            <h4>{chat.userName}</h4>
          </div>
          <span className="chat-time">{formatTime(chat.lastActivity)}</span>
        </div>
        <div className="message-check">
          <p className="chat-preview">{chat.lastMessage}</p>
          {chat.unreadCount > 0 && (
            <span className="unread-badge">{chat.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
