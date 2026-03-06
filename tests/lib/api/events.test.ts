import axios from "@/lib/api/axios";
import {
  createEvent,
  getEvents,
  getUserEvents,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventById,
  respondToBudgetProposal,
  getBudgetNegotiationHistory,
} from "@/lib/api/events";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("frontend api/events", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("createEvent success", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } } as any);
    await expect(createEvent({ title: "A" } as any)).resolves.toEqual({ success: true });
  });

  it("createEvent failure", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "Bad event" } } });
    await expect(createEvent({} as any)).rejects.toThrow("Bad event");
  });

  it("getEvents success with filters", async () => {
    mockedAxios.get.mockResolvedValue({ data: { success: true, data: [] } } as any);
    await expect(getEvents({ category: "music" })).resolves.toEqual({ success: true, data: [] });
  });

  it("getEvents failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Fetch failed" } } });
    await expect(getEvents()).rejects.toThrow("Fetch failed");
  });

  it("getUserEvents success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);
    await expect(getUserEvents()).resolves.toEqual({ data: [] });
  });

  it("getUserEvents failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "No auth" } } });
    await expect(getUserEvents()).rejects.toThrow("No auth");
  });

  it("updateEvent success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { ok: 1 } } as any);
    await expect(updateEvent("e1", { title: "New" })).resolves.toEqual({ ok: 1 });
  });

  it("updateEvent failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Update failed" } } });
    await expect(updateEvent("e1", {})).rejects.toThrow("Update failed");
  });

  it("deleteEvent success", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } } as any);
    await expect(deleteEvent("e1")).resolves.toEqual({ deleted: true });
  });

  it("deleteEvent failure", async () => {
    mockedAxios.delete.mockRejectedValue({ response: { data: { message: "Delete failed" } } });
    await expect(deleteEvent("e1")).rejects.toThrow("Delete failed");
  });

  it("joinEvent success", async () => {
    mockedAxios.post.mockResolvedValue({ data: { joined: true } } as any);
    await expect(joinEvent("e1")).resolves.toEqual({ joined: true });
  });

  it("joinEvent failure", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "Already joined" } } });
    await expect(joinEvent("e1")).rejects.toThrow("Already joined");
  });

  it("leaveEvent success", async () => {
    mockedAxios.post.mockResolvedValue({ data: { left: true } } as any);
    await expect(leaveEvent("e1")).resolves.toEqual({ left: true });
  });

  it("leaveEvent failure", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "Leave failed" } } });
    await expect(leaveEvent("e1")).rejects.toThrow("Leave failed");
  });

  it("getEventById success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: { _id: "e1" } } } as any);
    await expect(getEventById("e1")).resolves.toEqual({ data: { _id: "e1" } });
  });

  it("getEventById failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Not found" } } });
    await expect(getEventById("e404")).rejects.toThrow("Not found");
  });

  it("respondToBudgetProposal success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(respondToBudgetProposal("e1", { accepted: true })).resolves.toEqual({ success: true });
  });

  it("respondToBudgetProposal failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Budget failed" } } });
    await expect(respondToBudgetProposal("e1", { accepted: false })).rejects.toThrow("Budget failed");
  });

  it("getBudgetNegotiationHistory success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);
    await expect(getBudgetNegotiationHistory("e1")).resolves.toEqual({ data: [] });
  });

  it("getBudgetNegotiationHistory failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "History failed" } } });
    await expect(getBudgetNegotiationHistory("e1")).rejects.toThrow("History failed");
  });
});
