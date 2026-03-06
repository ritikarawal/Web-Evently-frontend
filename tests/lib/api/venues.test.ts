import axios from "@/lib/api/axios";
import {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  toggleVenueStatus,
} from "@/lib/api/venues";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("frontend api/venues", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getVenues success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: [{ _id: "v1" }] } } as any);
    await expect(getVenues({ city: "ktm" })).resolves.toEqual([{ _id: "v1" }]);
  });

  it("getVenues failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Failed to fetch venues" } } });
    await expect(getVenues()).rejects.toThrow("Failed to fetch venues");
  });

  it("getVenueById success", async () => {
    mockedAxios.get.mockResolvedValue({ data: { data: { _id: "v1" } } } as any);
    await expect(getVenueById("v1")).resolves.toEqual({ _id: "v1" });
  });

  it("getVenueById failure", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "Not found" } } });
    await expect(getVenueById("v404")).rejects.toThrow("Not found");
  });

  it("createVenue success", async () => {
    mockedAxios.post.mockResolvedValue({ data: { data: { _id: "v2" } } } as any);
    await expect(createVenue({ name: "Hall" } as any)).resolves.toEqual({ _id: "v2" });
  });

  it("createVenue failure", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "Create failed" } } });
    await expect(createVenue({} as any)).rejects.toThrow("Create failed");
  });

  it("updateVenue success", async () => {
    mockedAxios.put.mockResolvedValue({ data: { data: { _id: "v1", name: "New" } } } as any);
    await expect(updateVenue("v1", { name: "New" })).resolves.toEqual({ _id: "v1", name: "New" });
  });

  it("updateVenue failure", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "Update failed" } } });
    await expect(updateVenue("v1", {})).rejects.toThrow("Update failed");
  });

  it("deleteVenue success", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { data: { deleted: true } } } as any);
    await expect(deleteVenue("v1")).resolves.toEqual({ deleted: true });
  });

  it("deleteVenue failure", async () => {
    mockedAxios.delete.mockRejectedValue({ response: { data: { message: "Delete failed" } } });
    await expect(deleteVenue("v1")).rejects.toThrow("Delete failed");
  });

  it("toggleVenueStatus success", async () => {
    (mockedAxios.patch as any).mockResolvedValue({ data: { data: { isActive: false } } });
    await expect(toggleVenueStatus("v1")).resolves.toEqual({ isActive: false });
  });

  it("toggleVenueStatus failure", async () => {
    (mockedAxios.patch as any).mockRejectedValue({ response: { data: { message: "Toggle failed" } } });
    await expect(toggleVenueStatus("v1")).rejects.toThrow("Toggle failed");
  });
});
