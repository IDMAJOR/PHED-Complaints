export interface FormData {
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaintDetails: string;
}

export interface Complaint {
  id: number;
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaint: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: Date;
}

export interface message {
  text: string;
  sender: string;
}

export interface Message {
  id: number;
  text: string;
  sender: "user" | "admin";
  status: "sent" | "delivered" | "read";
}

export interface Chat {
  roomId: number;
  userName: string;
  messages: Message[];
  unreadCount: number;
  lastActivity: Date;
}
