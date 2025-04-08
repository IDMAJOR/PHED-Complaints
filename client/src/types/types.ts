export interface FormData {
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaintDetails: string;
}

export interface Complaint {
  id: number;
  _id?: any;
  fullName: string;
  address: string;
  meterNumber: string;
  phoneNumber: string;
  complaintDetails: string;
  status: "Pending" | "In Progress" | "Resolved";
  createdAt: Date;
  tickedID: number;
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
  timestamp: Date;
}

export interface Chat {
  roomId: any;
  userName: string;
  messages: Message[];
  unreadCount: number;
  lastActivity: Date;
}
