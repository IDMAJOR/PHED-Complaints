import { Chat } from "../types/types";
import MessageList from "./MessageList";

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
      className={`chat-item ${selectedChat === chat.id ? "active" : ""}`}
      onClick={() => setSelectedChat(chat.id)}
    >
      <h4>{chat.userName}</h4>
      <p>{chat.lastMessage}</p>
      <span>{formatTime(chat.lastActivity)}</span>

      {/* Display the message list if this chat is selected */}
    </div>
  );
}
