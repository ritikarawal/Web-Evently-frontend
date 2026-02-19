import axios from './axios';

export interface VenueData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  capacity: number;
  pricePerHour?: number;
  pricePerDay?: number;
  amenities?: string[];
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  images?: string[];
  availability?: any;
}

export const getVenues = async (filters?: any) => {
  try {
    const res = await axios.get('/api/venues', { params: filters });
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch venues');
  }
};

export const getVenue = async (id: string) => {
  try {
    const res = await axios.get(`/api/venues/${id}`);
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to fetch venue');
  }
};

export const createVenue = async (data: VenueData) => {
  try {
    const res = await axios.post('/api/venues', data);
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to create venue');
  }
};

export const updateVenue = async (id: string, data: Partial<VenueData>) => {
  try {
    const res = await axios.put(`/api/venues/${id}`, data);
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to update venue');
  }
};

export const deleteVenue = async (id: string) => {
  try {
    const res = await axios.delete(`/api/venues/${id}`);
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to delete venue');
  }
};

export const toggleVenueStatus = async (id: string) => {
  try {
    const res = await axios.patch(`/api/venues/${id}/toggle-status`);
    return res.data.data;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || 'Failed to toggle venue status');
  }
};
