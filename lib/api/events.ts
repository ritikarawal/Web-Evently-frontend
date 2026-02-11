import axios from "./axios";

export interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  capacity?: number;
  ticketPrice?: number;
  isPublic: boolean;
  duration?: string;
  notes?: string;
}

export const createEvent = async (eventData: CreateEventData) => {
  try {
    const response = await axios.post("/api/events", eventData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create event");
  }
};

export const getEvents = async (filters?: any) => {
  try {
    const response = await axios.get("/api/events", { params: filters });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch events");
  }
};

export const getUserEvents = async () => {
  try {
    const response = await axios.get("/api/events/user/my-events");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch user events");
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<CreateEventData>) => {
  try {
    const response = await axios.put(`/api/events/${eventId}`, eventData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update event");
  }
};

export const deleteEvent = async (eventId: string) => {
  try {
    const response = await axios.delete(`/api/events/${eventId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete event");
  }
};

export const joinEvent = async (eventId: string) => {
  try {
    const response = await axios.post(`/api/events/${eventId}/join`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to join event");
  }
};

export const leaveEvent = async (eventId: string) => {
  try {
    const response = await axios.post(`/api/events/${eventId}/leave`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to leave event");
  }
};

export const getEventById = async (eventId: string) => {
  try {
    const response = await axios.get(`/api/events/${eventId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch event");
  }
};