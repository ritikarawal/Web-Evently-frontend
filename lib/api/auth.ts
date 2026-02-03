// API layer
// Call api from backend

import axios from "./axios";
import { API } from "./endpoints";

interface RegisterData {
    username: string;
    email: string;
    password: string;
    // Add other fields as required by your backend
}

export const register = async (registerData: RegisterData) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER, //path
            registerData //body data
        );
        return response.data; // what controller from backend sends
    } catch (err: Error | unknown) {
        let message = "Registration failed";
        interface AxiosErrorShape {
            response?: {
                data?: {
                    message?: string;
                };
            };
            message?: string;
        }
        if (err && typeof err === "object") {
            const errorObj = err as AxiosErrorShape;
            if ("response" in err && typeof errorObj.response?.data?.message === "string") {
                message = errorObj.response!.data!.message!;
            } else if ("message" in err && typeof errorObj.message === "string") {
                message = errorObj.message!;
            }
        }
        throw new Error(message);
    };
    

}
interface LoginData {
    email: string;
    password: string;
    // Add other fields as required by your backend
}

export const login = async (loginData: LoginData) => {
    try{
        const response = await axios.post(
            API.AUTH.LOGIN, //path
            loginData //body data
        );
        return response.data; // what controller from backend sends
    } catch (err: Error | unknown) {
        let message = "Login failed";
        interface AxiosErrorShape {
            response?: {
                data?: {
                    message?: string;
                };
            };
            message?: string;
        }
        if (err && typeof err === "object") {
            const errorObj = err as AxiosErrorShape;
            if ("response" in err && typeof errorObj.response?.data?.message === "string") {
                message = errorObj.response!.data!.message!;
            } else if ("message" in err && typeof errorObj.message === "string") {
                message = errorObj.message!;
            }
        }
        throw new Error(message);
    };
    
}

export const getProfile = async () => {
    try {
        const response = await axios.get(API.AUTH.PROFILE);
        return response.data;
    } catch (err: Error | unknown) {
        let message = "Failed to fetch profile";
        interface AxiosErrorShape {
            response?: {
                data?: {
                    message?: string;
                };
            };
            message?: string;
        }
        if (err && typeof err === "object") {
            const errorObj = err as AxiosErrorShape;
            if ("response" in err && typeof errorObj.response?.data?.message === "string") {
                message = errorObj.response!.data!.message!;
            } else if ("message" in err && typeof errorObj.message === "string") {
                message = errorObj.message!;
            }
        }
        throw new Error(message);
    }
}

export const logout = () => {
    // Clear auth cookies on logout
    if (typeof document !== "undefined") {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
}

export const updateProfilePicture = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append("profilePicture", file);
        
        const response = await axios.post("/api/auth/user/profile-picture", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (err: Error | unknown) {
        let message = "Failed to update profile picture";
        interface AxiosErrorShape {
            response?: {
                data?: {
                    message?: string;
                };
            };
            message?: string;
        }
        if (err && typeof err === "object") {
            const errorObj = err as AxiosErrorShape;
            if ("response" in err && typeof errorObj.response?.data?.message === "string") {
                message = errorObj.response!.data!.message!;
            } else if ("message" in err && typeof errorObj.message === "string") {
                message = errorObj.message!;
            }
        }
        throw new Error(message);
    }
}

export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
}

export const updateProfile = async (data: UpdateProfileData) => {
    try {
        const response = await axios.put(API.AUTH.PROFILE, data);
        return response.data;
    } catch (err: Error | unknown) {
        let message = "Failed to update profile";
        interface AxiosErrorShape {
            response?: {
                data?: {
                    message?: string;
                };
            };
            message?: string;
        }
        if (err && typeof err === "object") {
            const errorObj = err as AxiosErrorShape;
            if ("response" in err && typeof errorObj.response?.data?.message === "string") {
                message = errorObj.response!.data!.message!;
            } else if ("message" in err && typeof errorObj.message === "string") {
                message = errorObj.message!;
            }
        }
        throw new Error(message);
    }
}