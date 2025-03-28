import { FiUser } from "react-icons/fi";
import { Chat } from "../types/types";

interface MessageListProps {
  selectedChat: Chat | null | undefined;
  formatTime: (date: Date) => string;
}

export default function MessageList({
  selectedChat,
  formatTime,
}: MessageListProps) {
  return (
    <div className="chat-detail">
      {selectedChat ? (
        <div className="active-chat">
          <h3>Chat with {selectedChat.userName}</h3>

          {/* Chat messages container */}
          <div className="chat-messages">
            <div className={`message ${selectedChat.sender}`}>
              <div className="message-avatar">
                {selectedChat.sender === "admin" ? (
                  <div className="admin-avatar">A</div>
                ) : (
                  <FiUser className="user-avatar" />
                )}
              </div>

              <div className="message-content">
                <div className="message-text">{selectedChat.lastMessage}</div>

                <div className="message-meta">
                  <span className="message-time">
                    {formatTime(selectedChat.lastActivity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Input field for sending messages */}
          <div className="chat-input">
            <input type="text" placeholder="Type your message..." />
            <button>Send</button>
          </div>
        </div>
      ) : (
        <div className="no-chat-selected">
          <p>Select a chat from the list</p>
        </div>
      )}
    </div>
  );
}
