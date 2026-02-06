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