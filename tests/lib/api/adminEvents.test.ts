import axios from "@/lib/api/axios";
import {
  getAllEvents,
  getPendingEvents,
  approveEvent,
  declineEvent,
  deleteEvent,
  acceptUserBudgetProposal,
  proposeBudget,
} from "@/lib/api/adminEvents";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("frontend api/adminEvents", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getAllEvents success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);
    await expect(getAllEvents()).resolves.toEqual({ data: [] });
  });

  it("getAllEvents failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Failed to fetch all events" } } });
    await expect(getAllEvents()).rejects.toThrow("Failed to fetch all events");
  });

  it("getPendingEvents success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [] } } as any);
    await expect(getPendingEvents()).resolves.toEqual({ data: [] });
  });

  it("getPendingEvents failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Failed to fetch pending events" } } });
    await expect(getPendingEvents()).rejects.toThrow("Failed to fetch pending events");
  });

  it("approveEvent success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(approveEvent("e1")).resolves.toEqual({ success: true });
  });

  it("approveEvent failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Failed to approve event" } } });
    await expect(approveEvent("e1")).rejects.toThrow("Failed to approve event");
  });

  it("declineEvent success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(declineEvent("e1", "Nope")).resolves.toEqual({ success: true });
  });

  it("declineEvent failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Failed to decline event" } } });
    await expect(declineEvent("e1")).rejects.toThrow("Failed to decline event");
  });

  it("deleteEvent success", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } } as any);
    await expect(deleteEvent("e1")).resolves.toEqual({ success: true });
  });

  it("deleteEvent failure", async () => {
    mockedAxios.delete.mockRejectedValue({ response: { data: { message: "Failed to delete event" } } });
    await expect(deleteEvent("e1")).rejects.toThrow("Failed to delete event");
  });

  it("acceptUserBudgetProposal success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(acceptUserBudgetProposal("e1")).resolves.toEqual({ success: true });
  });

  it("acceptUserBudgetProposal failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Failed to accept user's budget proposal" } } });
    await expect(acceptUserBudgetProposal("e1")).rejects.toThrow("Failed to accept user's budget proposal");
  });

  it("proposeBudget success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { success: true } } as any);
    await expect(proposeBudget("e1", { proposedBudget: 1000 })).resolves.toEqual({ success: true });
  });

  it("proposeBudget failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Failed to propose budget" } } });
    await expect(proposeBudget("e1", { proposedBudget: 1000 })).rejects.toThrow("Failed to propose budget");
  });
});
