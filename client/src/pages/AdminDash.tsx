import { useState } from "react";
import {
  FiMessageSquare,
  FiUser,
  FiMapPin,
  FiPhone,
  FiAlertCircle,
} from "react-icons/fi";

type Complaint = {
  id: number;
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaint: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: Date;
};

type Chat = {
  id: number;
  userId: number;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: Date;
};

export default function AdminDash() {
  const [activeTab, setActiveTab] = useState<"chats" | "complaints">("chats");

  // Sample complaints data
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 1,
      fullName: "John Doe",
      address: "123 Main St, Port Harcourt",
      meterNumber: "PHED-123456",
      phoneNumber: "08012345678",
      complaint: "No power supply for 3 days",
      status: "Pending",
      date: new Date(Date.now() - 86400000),
    },
    {
      id: 2,
      fullName: "Jane Smith",
      address: "456 Broad St, Port Harcourt",
      meterNumber: "PHED-789012",
      phoneNumber: "08087654321",
      complaint: "Faulty meter reading",
      status: "In Progress",
      date: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      fullName: "Mike Johnson",
      address: "789 Park Ave, Port Harcourt",
      meterNumber: "PHED-345678",
      phoneNumber: "08011223344",
      complaint: "High bill estimation",
      status: "Resolved",
      date: new Date(Date.now() - 259200000),
    },
  ]);

  // Sample chats data
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 1,
      userId: 101,
      userName: "John Doe",
      lastMessage: "Hello, I have a billing question...",
      unreadCount: 2,
      lastActivity: new Date(Date.now() - 1800000),
    },
    {
      id: 2,
      userId: 102,
      userName: "Jane Smith",
      lastMessage: "My power has been out since...",
      unreadCount: 0,
      lastActivity: new Date(Date.now() - 3600000),
    },
    {
      id: 3,
      userId: 103,
      userName: "Mike Johnson",
      lastMessage: "Thanks for resolving my issue!",
      unreadCount: 0,
      lastActivity: new Date(Date.now() - 86400000),
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<number | null>(
    null
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const updateComplaintStatus = (
    id: number,
    status: "Pending" | "In Progress" | "Resolved"
  ) => {
    setComplaints(
      complaints.map((complaint) =>
        complaint.id === id ? { ...complaint, status } : complaint
      )
    );
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>PHED Admin Dashboard</h2>
        <div className="admin-tabs">
          <button
            className={activeTab === "chats" ? "active" : ""}
            onClick={() => setActiveTab("chats")}
          >
            <FiMessageSquare /> Chats ({chats.length})
          </button>
          <button
            className={activeTab === "complaints" ? "active" : ""}
            onClick={() => setActiveTab("complaints")}
          >
            <FiAlertCircle /> Complaints ({complaints.length})
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === "chats" ? (
          <div className="chats-container">
            <div className="chat-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${
                    selectedChat === chat.id ? "active" : ""
                  }`}
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
                      <span className="chat-time">
                        {formatTime(chat.lastActivity)}
                      </span>
                    </div>
                    <div className="message-check">
                      <p className="chat-preview">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <span className="unread-badge">{chat.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="chat-detail">
              {selectedChat ? (
                <div className="active-chat">
                  <h3>
                    Chat with{" "}
                    {chats.find((c) => c.id === selectedChat)?.userName}
                  </h3>
                  {/* Chat messages would go here */}
                  <div className="chat-messages">
                    <p>Chat interface would be displayed here</p>
                  </div>
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
          </div>
        ) : (
          <div className="complaints-container">
            <div className="complaints-list">
              {complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className={`complaint-item ${
                    selectedComplaint === complaint.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedComplaint(complaint.id)}
                >
                  <div className="complaint-header">
                    <h4>{complaint.fullName}</h4>
                    <span
                      className={`status-badge ${complaint.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {complaint.status}
                    </span>
                  </div>
                  <p className="complaint-preview">
                    {complaint.complaint.substring(0, 60)}...
                  </p>
                  <div className="complaint-meta">
                    <span>
                      <FiMapPin /> {complaint.address}
                    </span>
                    <span>
                      <FiPhone /> {complaint.phoneNumber}
                    </span>
                    <span>{formatDate(complaint.date)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="complaint-detail">
              {selectedComplaint ? (
                <div className="active-complaint">
                  {(() => {
                    const complaint = complaints.find(
                      (c) => c.id === selectedComplaint
                    );
                    return complaint ? (
                      <>
                        <div className="complaint-header">
                          <h3>Complaint #{complaint.id}</h3>
                          <select
                            value={complaint.status}
                            onChange={(e) =>
                              updateComplaintStatus(
                                complaint.id,
                                e.target.value as
                                  | "Pending"
                                  | "In Progress"
                                  | "Resolved"
                              )
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>

                        <div className="complaint-field">
                          <label>
                            <FiUser /> Full Name
                          </label>
                          <p>{complaint.fullName}</p>
                        </div>

                        <div className="complaint-field">
                          <label>
                            <FiMapPin /> Address
                          </label>
                          <p>{complaint.address}</p>
                        </div>

                        <div className="complaint-field">
                          <label>Meter Number</label>
                          <p>{complaint.meterNumber}</p>
                        </div>

                        <div className="complaint-field">
                          <label>
                            <FiPhone /> Phone Number
                          </label>
                          <p>{complaint.phoneNumber}</p>
                        </div>

                        <div className="complaint-field">
                          <label>
                            <FiAlertCircle /> Complaint Details
                          </label>
                          <p>{complaint.complaint}</p>
                        </div>

                        <div className="complaint-field">
                          <label>Date Submitted</label>
                          <p>
                            {formatDate(complaint.date)} at{" "}
                            {formatTime(complaint.date)}
                          </p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="no-complaint-selected">
                  <p>Select a complaint from the list</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {activeTab === "complaints" && (
        <button className="ver-btn"> Proceed all to sheets</button>
      )}
    </div>
  );
}
