import axios from "./axios";

export const getPendingEvents = async () => {
  try {
    const response = await axios.get("/api/admin/events/pending");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch pending events");
  }
};

export const approveEvent = async (eventId: string) => {
  try {
    const response = await axios.put(`/api/admin/events/${eventId}/approve`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to approve event");
  }
};

export const declineEvent = async (eventId: string, adminNotes?: string) => {
  try {
    const response = await axios.put(`/api/admin/events/${eventId}/decline`, { adminNotes });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to decline event");
  }
};