export const setClientCookie = (name: string, value: string, maxAgeSeconds = 60 * 60 * 24 * 30) => {
  if (typeof document === "undefined") return;
  const encodedValue = encodeURIComponent(value);
  document.cookie = `${name}=${encodedValue}; path=/; max-age=${maxAgeSeconds}`;
};

export const setAuthTokenClient = (token: string) => {
  setClientCookie("auth_token", token);
};

export const setUserDataClient = (userData: unknown) => {
  setClientCookie("user_data", JSON.stringify(userData));
};

export const clearAuthCookiesClient = () => {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "user_data=; path=/; max-age=0";
};
