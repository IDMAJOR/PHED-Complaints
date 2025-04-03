import { useEffect, useState } from "react";
import {
  FiMessageSquare,
  FiUser,
  FiMapPin,
  FiPhone,
  FiAlertCircle,
} from "react-icons/fi";
import { Chat, Complaint } from "../types/types";

import { io } from "socket.io-client";
import ChatItem from "../components/ChatItem";
import MessageList from "../components/MessageList";
import { toast } from "react-toastify";

const socket = io("http://localhost:5040");

const roomId = 123456;
const userId = 132435;
export default function AdminDash() {
  const [activeTab, setActiveTab] = useState<"chats" | "complaints">("chats");
  // const [userMessage, setUserMessage] = useState<string[]>([]);

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

  const [newMessage, setNewMessage] = useState("");

  // Sample chats data
  const [chats, setChats] = useState<Chat[]>([
    {
      roomId: 101,
      userName: "Alex Carter",
      messages: [
        {
          id: 1,
          text: "Hey, is the React course still available?",
          sender: "user",
          status: "sent",
        },
        {
          id: 2,
          text: "Yes! Do you want a discount code?",
          sender: "admin",
          status: "delivered",
        },
        {
          id: 3,
          text: "That would be great! How much discount?",
          sender: "user",
          status: "sent",
        },
        {
          id: 4,
          text: "You can get 20% off if you sign up today.",
          sender: "admin",
          status: "read",
        },
      ],
      unreadCount: 2, // User hasn't read recent messages
      lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      roomId: 102,
      userName: "Sophia Lee",
      messages: [
        {
          id: 1,
          text: "Can we reschedule our meeting to Friday?",
          sender: "user",
          status: "delivered",
        },
        {
          id: 2,
          text: "Let me check my calendar. One moment.",
          sender: "admin",
          status: "read",
        },
        {
          id: 3,
          text: "Sure, Friday at 3 PM works!",
          sender: "admin",
          status: "read",
        },
        { id: 4, text: "Perfect, thanks!", sender: "user", status: "sent" },
      ],
      unreadCount: 0, // All messages read
      lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      roomId: 103,
      userName: "Derek Owens",
      messages: [
        {
          id: 1,
          text: "Hey, are you coming to the party tonight?",
          sender: "user",
          status: "sent",
        },
        {
          id: 2,
          text: "Yeah! What time does it start?",
          sender: "admin",
          status: "delivered",
        },
        {
          id: 3,
          text: "Around 8 PM. Bring some snacks!",
          sender: "user",
          status: "read",
        },
      ],
      unreadCount: 1, // One unread message
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      roomId: 104,
      userName: "Olivia Martin",
      messages: [
        {
          id: 1,
          text: "Do you have any updates on my order?",
          sender: "user",
          status: "sent",
        },
        {
          id: 2,
          text: "Yes! Your order will be delivered by tomorrow.",
          sender: "admin",
          status: "delivered",
        },
        {
          id: 3,
          text: "Great, thanks for the quick response!",
          sender: "user",
          status: "read",
        },
      ],
      unreadCount: 0, // Fully read conversation
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    },
    {
      roomId: 105,
      userName: "Nathan Rivera",
      messages: [
        {
          id: 1,
          text: "Hey bro, wanna game tonight?",
          sender: "user",
          status: "sent",
        },
        {
          id: 2,
          text: "For sure! Which game are we playing?",
          sender: "admin",
          status: "delivered",
        },
        {
          id: 3,
          text: "Maybe FIFA or COD. Up to you!",
          sender: "user",
          status: "read",
        },
      ],
      unreadCount: 3, // More unread messages
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    },
  ]);

  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<number | null>(
    null
  );

  // const [activeConversations, setActiveConversations] = useState<{
  //   [roomId: number]: {
  //     chatInfo: Chat;
  //     messages: any[];
  //   };
  // }>({});

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

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("http://localhost:5040/api/v1/chats/get");
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Invalid response format:", data);
          toast.error("Unexpected response format.");
          return;
        }

        console.log("Fetched data:", data);

        setChats((prevChats) => {
          const chatMap = new Map();

          prevChats.forEach((chat) => chatMap.set(chat.roomId, chat));

          data.forEach((newChat) => {
            console.log(`Processing roomId: ${newChat.roomId}`);

            const formattedMessages = Array.isArray(newChat.messages)
              ? newChat.messages
              : newChat.messages
              ? [newChat.messages]
              : [];

            if (chatMap.has(newChat.roomId)) {
              const existingChat = chatMap.get(newChat.roomId);

              // ✅ Prevent duplicate messages using a Set with unique message IDs
              const uniqueMessages = Array.from(
                new Map(
                  [...existingChat.messages, ...formattedMessages].map(
                    (msg) => [msg.id, msg]
                  )
                ).values()
              );

              chatMap.set(newChat.roomId, {
                ...existingChat,
                messages: uniqueMessages, // Store only unique messages
                unreadCount: newChat.unreadCount ?? existingChat.unreadCount,
                lastActivity: new Date(
                  newChat.lastActivity || existingChat.lastActivity
                ),
              });
            } else {
              chatMap.set(newChat.roomId, {
                ...newChat,
                messages: formattedMessages,
                lastActivity: new Date(newChat.lastActivity),
              });
            }
          });

          console.log("Updated chatMap:", Array.from(chatMap.values()));

          return Array.from(chatMap.values());
        });
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load chats. Please try again.");
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    socket.emit("join_room", { roomId, userId });

    socket.on("online", (data) => {
      console.log(data);
    });

    // Ensure old listener is removed before adding a new one
    socket.off("receiveMessage").on("receiveMessage", (data) => {
      console.log("New message:", data);

      setChats((prevChats) => {
        const chatExists = prevChats.find(
          (chat) => chat.roomId === data.roomId
        );

        if (chatExists) {
          // Update the existing chat and append the new message
          return prevChats.map((chat) =>
            chat.roomId === data.roomId
              ? {
                  ...chat,
                  messages: [...chat.messages, data.messages], // Append new message
                  unreadCount: data.unreadCount, // Update unread count
                  lastActivity: new Date(data.lastActivity), // Ensure valid Date object
                }
              : chat
          );
        } else {
          // Add a new chat if it doesn't exist
          return [
            ...prevChats,
            {
              ...data,
              messages: [data.messages], // Initialize messages array with first message
              lastActivity: new Date(data.lastActivity),
            },
          ];
        }
      });
    });

    return () => {
      socket.off("receiveMessage"); // Cleanup on unmount
    };
  }, [socket]);

  type Message = {
    id: number;
    message: string;
    roomId: number;
    userName: string;
    sender: "user" | "admin";
    timestamp: Date;
    status: "sent" | "delivered" | "read";
  };

  const handleSend = async () => {
    if (newMessage.trim() === "") return;

    const newMessageObj: Message = {
      id: Date.now(), // Temporary unique ID
      roomId: roomId,
      userName: "Admin",
      message: newMessage,
      sender: "admin",
      timestamp: new Date(),
      status: "sent",
    };

    // Emit message to the server
    await socket.emit("send_message", newMessageObj);

    // Update chats properly
    // Clear input
    setNewMessage("");
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(
          `http://localhost:5040/api/v1/complaints/get/${"true"}`
        );

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message);
        }

        console.log(data);
      } catch (error: any) {
        toast.error(error);
      }
    };
  }, []);

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
              {chats.map((chat, index) => (
                <ChatItem
                  chat={chat}
                  key={chat.roomId + index}
                  selectedChat={selectedChat}
                  setSelectedChat={setSelectedChat}
                  formatTime={formatTime}
                />
              ))}
            </div>
            {selectedChat !== null ? (
              <MessageList
                selectedChat={chats.find(
                  (chat) => chat.roomId === selectedChat
                )}
                formatTime={formatTime}
                handleSend={handleSend}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
              />
            ) : (
              <div
                className="no-chat-selected"
                style={{
                  margin: " 0 auto",
                }}
              >
                <p>Open a chat to start messaging</p>{" "}
              </div>
            )}
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
                          <label>Ticket ID</label>
                          <p>{"40320250099"}</p>
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
