import { API } from "@/lib/api/endpoints";

describe("api endpoints constants", () => {
  it("contains auth login/register/profile endpoints", () => {
    expect(API.AUTH.LOGIN).toBe("/api/auth/login");
    expect(API.AUTH.REGISTER).toBe("/api/auth/register");
    expect(API.AUTH.PROFILE).toBe("/api/auth/profile");
  });

  it("generates reset password endpoint with token", () => {
    expect(API.AUTH.RESET_PASSWORD("abc")).toBe("/api/auth/reset-password/abc");
  });

  it("contains admin users endpoints", () => {
    expect(API.ADMIN.USERS).toBe("/api/admin/users");
    expect(API.ADMIN.USER("u1")).toBe("/api/admin/users/u1");
  });
});
