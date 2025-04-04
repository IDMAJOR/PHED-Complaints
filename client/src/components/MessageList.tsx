import { FiUser } from "react-icons/fi";
import { Chat } from "../types/types";
import { BsCheck2All } from "react-icons/bs";

interface MessageListProps {
  selectedChat: Chat | null | undefined;
  formatTime: (date: Date) => string;
  handleSend: Function;
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
}

export default function MessageList({
  selectedChat,
  formatTime,
  handleSend,
  newMessage,
  setNewMessage,
}: MessageListProps) {
  console.log("This is it: ", selectedChat);
  if (!selectedChat) {
    return (
      <div className="chat-detail">
        <div className="no-chat-selected">
          <p>Select a chat from the list</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-detail">
      <div className="active-chat">
        <h3>Chat with {selectedChat.userName}</h3>

        {/* Chat messages container */}
        <div className="chat-messages">
          {selectedChat.messages.length > 0 ? (
            selectedChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === "user" ? "user2" : "agent2"
                }`}
              >
                <div className="message-avatar">
                  {msg.sender === "admin" ? (
                    <div className="agent-avatar">A</div>
                  ) : (
                    <FiUser className="user-avatar" />
                  )}
                </div>

                <div className="message-content">
                  <div className="message-text">{msg.text}</div>

                  <div className="message-meta">
                    <span className="message-time">
                      {formatTime(new Date())}
                    </span>

                    {msg.sender === "admin" && (
                      <span className="message-status sent">
                        <BsCheck2All />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-messages">No messages yet</p>
          )}
        </div>

        {/* Input field for sending messages */}
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onKeyPress={(e) =>
              e.key === "Enter" && newMessage && handleSend(selectedChat.roomId)
            }
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button onClick={() => void handleSend(selectedChat.roomId)}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
