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

export interface Chat {
  id: any;
  roomId: number;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  lastActivity: any;
  sender: string;
}
