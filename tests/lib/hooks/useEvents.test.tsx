import { renderHook, waitFor } from "@testing-library/react";
import { useEvents } from "@/lib/hooks/useEvents";
import { getEvents } from "@/lib/api/events";

jest.mock("@/lib/api/events", () => ({
  getEvents: jest.fn(),
}));

const mockedGetEvents = getEvents as jest.MockedFunction<typeof getEvents>;

describe("useEvents hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads events from API when success is true", async () => {
    mockedGetEvents.mockResolvedValue({ success: true, data: [{ id: 1, category: "birthday" }] } as any);

    const { result } = renderHook(() => useEvents("birthday"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([{ id: 1, category: "birthday" }]);
  });

  it("falls back to mock data when success is false", async () => {
    mockedGetEvents.mockResolvedValue({ success: false, data: [] } as any);

    const { result } = renderHook(() => useEvents("birthday"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events.length).toBeGreaterThan(0);
    expect(result.current.events.every((e) => e.category === "birthday")).toBe(true);
  });

  it("falls back to mock data on API error", async () => {
    mockedGetEvents.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useEvents("birthday"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it("refetches when category changes", async () => {
    mockedGetEvents.mockResolvedValue({ success: true, data: [] } as any);

    const { rerender } = renderHook(({ category }) => useEvents(category), {
      initialProps: { category: "birthday" },
    });

    rerender({ category: "conference" });

    await waitFor(() => expect(mockedGetEvents).toHaveBeenCalledWith({ category: "conference" }));
  });

  it("starts in loading state", () => {
    mockedGetEvents.mockResolvedValue({ success: true, data: [] } as any);

    const { result } = renderHook(() => useEvents("birthday"));

    expect(result.current.loading).toBe(true);
  });

  it("returns default error null", async () => {
    mockedGetEvents.mockResolvedValue({ success: true, data: [] } as any);

    const { result } = renderHook(() => useEvents("birthday"));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
