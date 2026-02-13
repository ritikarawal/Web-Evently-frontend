import axios from "./axios";

export const getAllEvents = async () => {
  try {
    console.log('[getAllEvents] Making request to /api/admin/events');
    const response = await axios.get("/api/admin/events");
    console.log('[getAllEvents] Response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[getAllEvents] Error:', error);
    console.error('[getAllEvents] Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to fetch all events");
  }
};

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

export const deleteEvent = async (eventId: string) => {
  try {
    const response = await axios.delete(`/api/admin/events/${eventId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete event");
  }
};

export const acceptUserBudgetProposal = async (eventId: string) => {
  try {
    const response = await axios.put(`/api/admin/events/${eventId}/accept-user-budget`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to accept user's budget proposal");
  }
};

export const proposeBudget = async (eventId: string, data: {
  proposedBudget: number;
  message?: string;
}) => {
  try {
    const response = await axios.put(`/api/admin/events/${eventId}/budget-proposal`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to propose budget");
  }
};