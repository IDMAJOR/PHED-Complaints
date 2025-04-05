import { useEffect, useState } from "react";
import {
  FiMessageSquare,
  FiUser,
  FiMapPin,
  FiPhone,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { Chat, Complaint } from "../types/types";

import { io } from "socket.io-client";
import ChatItem from "../components/ChatItem";
import MessageList from "../components/MessageList";
import { toast } from "react-toastify";
import moment from "moment"; // Import moment

const socket = io("https://phed-complaints.onrender.com");

const userId = 132435;
export default function AdminDash() {
  const [activeTab, setActiveTab] = useState<"chats" | "complaints">("chats");
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [key, setKey] = useState<string>("");
  const [adminName, setAdminName] = useState<string>("");
  const [complaintsForm, setComplaintsForm] = useState<any | null>(null);

  // Sample complaints data
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [newMessage, setNewMessage] = useState("");

  // Sample chats data
  const [chats, setChats] = useState<Chat[]>([]);

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

  // const formatDate = (date: Date) => {
  //   return date.toLocaleDateString("en-NG", {
  //     day: "numeric",
  //     month: "short",
  //     year: "numeric",
  //   });
  // };

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
        const response = await fetch(
          "https://phed-complaints.onrender.com/api/v1/chats/get",
          {
            method: "GET",
            credentials: "include",
          }
        );
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || 400) {
            toast.error("Please verify your an admin");
            setIsSignedIn(false);
            return;
          }
          toast.error(data.message);
          return;
        }

        if (!Array.isArray(data)) {
          console.error("Invalid response format:", data);
          toast.error("Unexpected response format.");
          return;
        }

        setIsSignedIn(true);

        setChats((prevChats) => {
          const chatMap = new Map();

          prevChats.forEach((chat) => chatMap.set(chat.roomId, chat));

          data.forEach((newChat) => {
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

          return Array.from(chatMap.values());
        });
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load chats. Please try again.");
      }
    };

    fetchChats();
  }, [isSignedIn, socket]);

  useEffect(() => {
    socket.emit("join_room", { roomId: selectedChat, userId });

    socket.on("online", (data) => {
      console.log(data);
    });

    // Ensure old listener is removed before adding a new one
    socket.off("receiveMessage").on("receiveMessage", (data) => {
      // console.log("New message:", data);

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
  }, [socket, selectedChat]);

  type Message = {
    id: number;
    message: string;
    roomId: number;
    userName: string;
    sender: "user" | "admin";
    timestamp: Date;
    status: "sent" | "delivered" | "read";
  };

  const handleSend = async (roomId: number) => {
    if (newMessage.trim() === "") return;

    const newMessageObj: Message = {
      id: Date.now(), // Temporary unique ID
      roomId: roomId,
      userName: chats[0].userName,
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
          `https://phed-complaints.onrender.com/api/v1/complaints/get`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || 400) {
            toast.error("Please verify your an admin");
            setIsSignedIn(false);
            return;
          }
          toast.error(data.message);
          return;
        }

        setIsSignedIn(true);
        console.log("complaints ---", data.data.complaints);

        setComplaints(data.data.complaints);
      } catch (error: any) {
        toast.error(error);
      }
    };

    fetchComplaints();
  }, [isSignedIn]);

  const logAdmin = async () => {
    // console.log(adminName, key);
    try {
      const response = await fetch(
        "https://phed-complaints.onrender.com/api/v1/admin/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ agentname: adminName, key }),
        }
      );

      const data = await response.json();

      // console.log(data);

      if (!response.ok) {
        toast.error(data.message);
        return;
      }

      setIsSignedIn(true);
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSubmitToSheets = async (e: any) => {
    e.preventDefault();

    console.log("Running...");

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbzZ6wUeIzRaVV1Z1CpCvm41PA62a_r_ei_UnjfvivKBgrwu0aRXm-U3cBPn2V_zxLxMuw/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(complaintsForm),
        }
      );

      const result = await response.json();
      console.log("Form submitted:", result);
      toast.success("Success!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Submission failed!");
    }
  };
  setComplaintsForm({
    name: "John Doe",
    email: "john@example.com",
    message: "The air conditioner is broken.",
  });

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2>PHED Admin Dashboard</h2>
          {!isSignedIn ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                backgroundColor: "var(--border-color)",
                borderRadius: 20,
                padding: 2,
              }}
            >
              <input
                type="name"
                placeholder="Enter an admin name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                style={{
                  padding: 7,
                  border: "none",
                  outline: "none",
                  borderRadius: 20,
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  backgroundColor: "var(--input-bg)",
                }}
              />
              <input
                type="key"
                placeholder="Insert your key here..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                style={{
                  padding: 7,
                  border: "none",
                  outline: "none",
                  borderRadius: 20,
                  fontSize: "0.9rem",
                  color: "var(--text-muted)",
                  backgroundColor: "var(--input-bg)",
                }}
              />
              <button
                onClick={() => logAdmin()}
                style={{
                  fontSize: "1rem",
                  width: 30,
                  height: 30,
                  padding: 5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",
                  border: "none",
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  backgroundColor: "var(--input-bg)",
                }}
              >
                <FiCheck />
              </button>
            </div>
          ) : (
            <div>
              <h2>Welcome {"Miss Chioma"}</h2>
            </div>
          )}
        </div>

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
              {chats
                .sort(
                  (a, b) =>
                    new Date(b.lastActivity).getTime() -
                    new Date(a.lastActivity).getTime()
                ) // Sort by lastActivity timestamp
                .map((chat, index) => (
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
              {complaints
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                ) // Sort by lastActivity timestamp
                .map((complaint) => (
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
                      {complaint.complaintDetails.substring(0, 60)}...
                    </p>
                    <div className="complaint-meta">
                      <span>
                        <FiMapPin /> {complaint.address}
                      </span>
                      <span>
                        <FiPhone /> {complaint.phoneNumber}
                      </span>
                      <span>{moment(complaint.createdAt).format("LL")}</span>
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
                          <p>{complaint.complaintDetails}</p>
                        </div>

                        <div className="complaint-field">
                          <label>Ticket ID</label>
                          <p>{"40320250099"}</p>
                        </div>

                        <div className="complaint-field">
                          <label>Date Submitted</label>
                          <p>
                            <span>
                              {moment(complaint.createdAt).format("LL")}
                            </span>{" "}
                            By{" "}
                            <span>
                              {moment(complaint.createdAt).format("h:mm A")}
                            </span>
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
        <button className="ver-btn" onChange={(e) => handleSubmitToSheets(e)}>
          Proceed all to sheets
        </button>
      )}
    </div>
  );
}
