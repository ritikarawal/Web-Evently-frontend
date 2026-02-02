import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getCookieValue = (name: string) => {
    if (typeof document === "undefined") return null;
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(nameEQ)) {
            const value = cookie.substring(nameEQ.length);
            try {
                return decodeURIComponent(value);
            } catch {
                return value;
            }
        }
    }
    return null;
};

axiosInstance.interceptors.request.use((config) => {
    const token = getCookieValue("auth_token");
    console.log('[axios interceptor] token:', token ? 'present' : 'missing');
    console.log('[axios interceptor] config.url:', config.url);
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[axios interceptor] Authorization header set');
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('[axios interceptor] 401 Unauthorized:', error.response?.data?.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;