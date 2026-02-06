
export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        PROFILE: '/api/auth/profile',
        REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
    }
    ,
    ADMIN: {
        USERS: '/api/admin/users',
        USER: (id: string) => `/api/admin/users/${id}`,
    }
}