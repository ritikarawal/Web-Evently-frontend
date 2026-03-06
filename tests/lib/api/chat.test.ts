import axios from "@/lib/api/axios";
import {
  getMyChatHistory,
  sendUserChatMessage,
  getAdminChatUsers,
  getAdminUserChat,
  sendAdminChatMessage,
} from "@/lib/api/chat";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("frontend api/chat", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getMyChatHistory returns payload data", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [{ text: "Hi" }] } } as any);
    await expect(getMyChatHistory()).resolves.toEqual([{ text: "Hi" }]);
  });

  it("getMyChatHistory returns empty array when missing data", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} } as any);
    await expect(getMyChatHistory()).resolves.toEqual([]);
  });

  it("sendUserChatMessage returns nested data", async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: { _id: "m1" } } } as any);
    await expect(sendUserChatMessage({ text: "hello" })).resolves.toEqual({ _id: "m1" });
  });

  it("sendUserChatMessage calls endpoint", async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: {} } } as any);
    await sendUserChatMessage({ text: "hello", username: "u" });
    expect(mockedAxios.post).toHaveBeenCalledWith("/api/chat/user/send", { text: "hello", username: "u" });
  });

  it("getAdminChatUsers returns payload data", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [{ _id: "u1" }] } } as any);
    await expect(getAdminChatUsers()).resolves.toEqual([{ _id: "u1" }]);
  });

  it("getAdminChatUsers returns empty array when no data", async () => {
    mockedAxios.get.mockResolvedValue({ data: {} } as any);
    await expect(getAdminChatUsers()).resolves.toEqual([]);
  });

  it("getAdminUserChat returns thread data", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: { userId: "u1", messages: [] } } } as any);
    await expect(getAdminUserChat("u1")).resolves.toEqual({ userId: "u1", messages: [] });
  });

  it("getAdminUserChat calls user endpoint", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: {} } } as any);
    await getAdminUserChat("u55");
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/chat/admin/user/u55");
  });

  it("sendAdminChatMessage returns nested data", async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: { _id: "m2" } } } as any);
    await expect(sendAdminChatMessage("u1", { text: "ok" })).resolves.toEqual({ _id: "m2" });
  });

  it("sendAdminChatMessage calls user send endpoint", async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: {} } } as any);
    await sendAdminChatMessage("u1", { text: "ok", adminName: "Admin" });
    expect(mockedAxios.post).toHaveBeenCalledWith("/api/chat/admin/user/u1/send", {
      text: "ok",
      adminName: "Admin",
    });
  });
});
