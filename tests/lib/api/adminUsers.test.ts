import axios from "@/lib/api/axios";
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from "@/lib/api/adminUsers";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("frontend api/adminUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getAllUsers success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);
    await expect(getAllUsers(1, 10)).resolves.toEqual({ data: [] });
    expect(mockedAxios.get).toHaveBeenCalledWith("/api/admin/users", { params: { page: 1, limit: 10 } });
  });

  it("getAllUsers throws axios error", async () => {
    const err = new Error("boom");
    mockedAxios.get.mockRejectedValue(err);
    await expect(getAllUsers()).rejects.toThrow("boom");
  });

  it("getUserById success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: { _id: "u1" } } } as any);
    await expect(getUserById("u1")).resolves.toEqual({ data: { _id: "u1" } });
  });

  it("createUser success", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } } as any);
    await expect(createUser({ firstName: "A", image: null })).resolves.toEqual({ success: true });
  });

  it("createUser supports image field", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } } as any);
    const file = new File(["a"], "a.png", { type: "image/png" });
    await expect(createUser({ firstName: "A", image: file })).resolves.toEqual({ success: true });
  });

  it("updateUser success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(updateUser("u1", { firstName: "A" })).resolves.toEqual({ success: true });
  });

  it("updateUser supports image field", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    const file = new File(["b"], "b.png", { type: "image/png" });
    await expect(updateUser("u1", { image: file })).resolves.toEqual({ success: true });
  });

  it("deleteUser success", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } } as any);
    await expect(deleteUser("u1")).resolves.toEqual({ success: true });
  });

  it("deleteUser failure", async () => {
    mockedAxios.delete.mockRejectedValue({ response: { data: { message: "Delete failed" } } });
    await expect(deleteUser("u1")).rejects.toEqual({ response: { data: { message: "Delete failed" } } });
  });

  it("updateUser failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Update failed" } } });
    await expect(updateUser("u1", { firstName: "x" })).rejects.toEqual({ response: { data: { message: "Update failed" } } });
  });

  it("createUser failure", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "Create failed" } } });
    await expect(createUser({ firstName: "x" })).rejects.toEqual({ response: { data: { message: "Create failed" } } });
  });

  it("getUserById failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Not found" } } });
    await expect(getUserById("bad")).rejects.toEqual({ response: { data: { message: "Not found" } } });
  });
});
