
export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        PROFILE: '/api/auth/profile',
    }
    ,
    ADMIN: {
        USERS: '/api/admin/users',
        USER: (id: string) => `/api/admin/users/${id}`,
    }
}