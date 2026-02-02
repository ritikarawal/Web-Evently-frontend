import axios from "./axios";
import { API } from "./endpoints";

export interface AdminUserPayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: "user" | "admin";
  phoneNumber?: string;
  image?: File | null;
}

export const getAllUsers = async () => {
  const response = await axios.get(API.ADMIN.USERS);
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await axios.get(API.ADMIN.USER(id));
  return response.data;
};

export const createUser = async (payload: AdminUserPayload) => {
  const formData = new FormData();

  if (payload.firstName) formData.append("firstName", payload.firstName);
  if (payload.lastName) formData.append("lastName", payload.lastName);
  if (payload.username) formData.append("username", payload.username);
  if (payload.email) formData.append("email", payload.email);
  if (payload.password) formData.append("password", payload.password);
  if (payload.confirmPassword) formData.append("confirmPassword", payload.confirmPassword);
  if (payload.role) formData.append("role", payload.role);
  if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
  if (payload.image) formData.append("image", payload.image);

  const response = await axios.post(API.ADMIN.USERS, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateUser = async (id: string, payload: AdminUserPayload) => {
  const formData = new FormData();

  if (payload.firstName) formData.append("firstName", payload.firstName);
  if (payload.lastName) formData.append("lastName", payload.lastName);
  if (payload.username) formData.append("username", payload.username);
  if (payload.email) formData.append("email", payload.email);
  if (payload.password) formData.append("password", payload.password);
  if (payload.confirmPassword) formData.append("confirmPassword", payload.confirmPassword);
  if (payload.role) formData.append("role", payload.role);
  if (payload.phoneNumber) formData.append("phoneNumber", payload.phoneNumber);
  if (payload.image) formData.append("image", payload.image);

  const response = await axios.put(API.ADMIN.USER(id), formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await axios.delete(API.ADMIN.USER(id));
  return response.data;
};
