import axios from "./axios";

export interface PersistedChatMessage {
  _id?: string;
  from: "user" | "admin";
  text: string;
  timestamp: string | number | Date;
  username?: string;
  senderName?: string;
}

export const getMyChatHistory = async () => {
  const response = await axios.get("/api/chat/history");
  const payload = response.data as any;
  return payload?.data || [];
};

export const sendUserChatMessage = async (payload: {
  text: string;
  username?: string;
  senderName?: string;
}) => {
  const response = await axios.post("/api/chat/user/send", payload);
  return (response.data as any)?.data;
};

export const getAdminChatUsers = async () => {
  const response = await axios.get("/api/chat/admin/users");
  const payload = response.data as any;
  return payload?.data || [];
};

export const getAdminUserChat = async (userId: string) => {
  const response = await axios.get(`/api/chat/admin/user/${userId}`);
  return (response.data as any)?.data;
};

export const sendAdminChatMessage = async (
  userId: string,
  payload: { text: string; adminName?: string }
) => {
  const response = await axios.post(`/api/chat/admin/user/${userId}/send`, payload);
  return (response.data as any)?.data;
};
