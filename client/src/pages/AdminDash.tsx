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
import moment from "moment";
import { format } from "date-fns";
import LoadingBar from "../components/LoadingBar";

const socket = io("https://phed-complaints.onrender.com");

const userId = 132435;

export default function AdminDash() {
  const [activeTab, setActiveTab] = useState<"chats" | "complaints">(
    "complaints"
  );
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [key, setKey] = useState<string>("");
  const [adminName, setAdminName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [ticketID, setTicketID] = useState<any>(" ");
  const [pushingPercent, setPushingPercent] = useState<any>(0);
  const [playNotificationSound, setPlayNotificationSound] = useState(false);

  const [complaints, setComplaints] = useState<Complaint[]>([]);

  const [newMessage, setNewMessage] = useState("");

  // Sample chats data
  const [chats, setChats] = useState<Chat[]>([]);

  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [selectedPush, setSelectedPush] = useState<any>(
    "Proceed one to sheets"
  );
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
          setPlayNotificationSound(true);
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
          setPlayNotificationSound(true);
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

  const LoadPercent = (pushed: any, total: any) => {
    if (!total) return 0;
    const percentPushed = (pushed / total) * 100;
    const percent = Math.min(percentPushed, 100); // Avoid going above 100%
    setPushingPercent(percent);
    return;
  };

  const handleSingleSubmit = async (complaints: any, e: any) => {
    e.preventDefault();
    setIsLoading(true);
    let pushed = 0;

    const formData = {
      Ticket: complaints.tickedID,
      Name: complaints.fullName,
      Address: complaints.address,
      Phone: complaints.phoneNumber,
      Meter: complaints.meterNumber,
      Category: " ",
      Nature: " ",
      Source: " ",
      Details: complaints.complaintDetails,
    };

    console.log(complaints);
    console.log(formData);

    try {
      const formPayload = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });

      console.log(formPayload);
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbwzD6IlaVZLKKZ1porJeeyl3d2q4mzWr2JvCZmGCliJ3Fb1M5PtnYF6yvv96wuRT139eA/exec",
        {
          method: "POST",
          body: formPayload,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!res.ok) throw new Error("Submission failed");

      // const data = await res.json();

      pushed += 1;
      LoadPercent(pushed, complaints.length);
      toast.success("Complaints pushed to sheets");
      setPushingPercent(0);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipleSubmit = async (complaintsList: any[], e: any) => {
    e.preventDefault();
    setIsLoading(true);
    let pushed = 0;

    for (const complaint of complaintsList) {
      const formData = {
        Ticket: complaint.tickedID, // maybe generate unique IDs?
        Name: complaint.fullName,
        Address: complaint.address,
        Phone: complaint.phoneNumber,
        Meter: complaint.meterNumber,
        Category: " ",
        Nature: " ",
        Source: " ",
        Details: complaint.complaintDetails,
      };

      const formPayload = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });

      try {
        const res = await fetch(
          "https://script.google.com/macros/s/AKfycbwzD6IlaVZLKKZ1porJeeyl3d2q4mzWr2JvCZmGCliJ3Fb1M5PtnYF6yvv96wuRT139eA/exec",
          {
            method: "POST",
            body: formPayload,
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        if (!res.ok)
          throw new Error(`Submission failed for ${complaint.fullName}`);
        // const data = await res.json();
        // console.log(`✅ Submitted for ${complaint.fullName}`, data);
        pushed += 1;
        LoadPercent(pushed, complaintsList.length);
        if (pushingPercent && !isLoading && complaintsList.length === pushed) {
          toast.success("Complaints pushed to sheets");
          setPushingPercent(0);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(error.message);
      }
    }

    setIsLoading(false);
  };

  const handleTodaySubmit = (complaintsList: any[], e: any) => {
    e.preventDefault();
    const today = format(new Date(), "yyyy-MM-dd");

    console.log(today);

    const todaysComplaints = complaintsList.filter((complaint) => {
      const complaintDate = format(new Date(complaint.createdAt), "yyyy-MM-dd");
      return complaintDate === today;
    });

    if (todaysComplaints.length === 0) {
      toast.warn("No complaints today 🙂");
      return;
    }

    handleMultipleSubmit(todaysComplaints, e);
  };

  const handleContextMenu = (e: any) => {
    e.preventDefault(); // ⛔ Stops browser menu from appearing

    toast.warn("Nothing to push 🤔");
  };

  const updateTicketID = async (complaintID: any) => {
    console.log({ ticketID, complaintID });

    try {
      const res = await fetch(
        "https://phed-complaints.onrender.com/api/v1/complaints/update",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ complaintID, tickedID: ticketID }),
        }
      );

      const data = await res.json();
      console.log(data);
      if (res.ok) {
        toast.success("Updated successfully");
        setIsEditing(false);
        setTicketID("");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    console.log(playNotificationSound);
    if (playNotificationSound === true) {
      const audio = new Audio("/mixkit-liquid-bubble-3000.wav");
      audio.play();
    }

    setPlayNotificationSound(false);
  }, [playNotificationSound]);

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
                          <p onClick={() => setIsEditing(true)}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={ticketID}
                                onChange={(e) => setTicketID(e.target.value)}
                                style={{
                                  height: "100%",
                                  width: "100%",
                                  padding: 5,
                                  backgroundColor: "var(--background-color)",
                                  border: "none",
                                  outline: "none",
                                  color: "var(--text-color)",
                                  fontSize: "1rem",
                                }}
                              />
                            ) : complaint.tickedID ? (
                              complaint.tickedID
                            ) : (
                              "No ticket id yet click to add"
                            )}
                          </p>
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
                        {activeTab === "complaints" &&
                        !isEditing &&
                        !isLoading ? (
                          // <button
                          //   className="ver-btn"
                          //   onClick={() => handleSubmit(complaint)}
                          //   onContextMenu={(e) => handleContextMenu(e)}
                          // >
                          //   Proceed all to sheets
                          // </button>
                          <select
                            id="actionSelect"
                            onChange={(e) => setSelectedPush(e.target.value)}
                            className="ver-btn"
                            value={selectedPush}
                            // onClick={() => handleSubmit(complaint)}
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              selectedPush === "Proceed one to sheets"
                                ? handleSingleSubmit(complaint, e)
                                : selectedPush === "Proceed all to sheets"
                                ? handleMultipleSubmit(complaints, e)
                                : selectedPush === "Proceed today to sheets"
                                ? handleTodaySubmit(complaints, e)
                                : handleContextMenu(e)
                            }
                            onContextMenu={(e) => handleContextMenu(e)}
                          >
                            <option value="Proceed one to sheets">
                              Proceed one to sheets
                            </option>
                            <option value="Proceed all to sheets">
                              Proceed all to sheets
                            </option>
                            <option value="Proceed today to sheets">
                              Proceed today to sheets
                            </option>
                          </select>
                        ) : activeTab === "complaints" &&
                          !isLoading &&
                          isEditing ? (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: "transparent",
                              padding: 0,
                            }}
                            className="ver-btn"
                          >
                            <button
                              className="ver-btn rise"
                              onClick={() => updateTicketID(complaint.id)}
                              style={{
                                color: "white",
                                borderRadius: 15,
                                position: "relative",
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="ver-btn rise"
                              onClick={() => setIsEditing(false)}
                              style={{
                                color: "white",
                                borderRadius: 15,
                                position: "relative",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          isLoading && <LoadingBar percent={pushingPercent} />
                        )}
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
    </div>
  );
}
