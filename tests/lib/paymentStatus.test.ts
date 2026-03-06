import {
  getPaymentStatus,
  setPaymentStatus,
  clearPaymentStatus,
  getEventPaymentSummary,
  addPaymentNotification,
  getPaymentNotifications,
} from "@/lib/paymentStatus";

describe("paymentStatus utils", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.spyOn(Date, "now").mockReturnValue(1700000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns unpaid by default", () => {
    expect(getPaymentStatus("e1", "u1")).toBe("unpaid");
  });

  it("stores and returns paid status", () => {
    setPaymentStatus("e1", "u1", "paid");
    expect(getPaymentStatus("e1", "u1")).toBe("paid");
  });

  it("clearPaymentStatus removes a user payment status", () => {
    setPaymentStatus("e1", "u1", "paid");
    clearPaymentStatus("e1", "u1");
    expect(getPaymentStatus("e1", "u1")).toBe("unpaid");
  });

  it("getEventPaymentSummary handles attendee objects", () => {
    setPaymentStatus("e1", "u1", "paid");

    const result = getEventPaymentSummary("e1", [
      { _id: "u1", firstName: "A", lastName: "B" },
      { _id: "u2", username: "two" },
    ]);

    expect(result.rows).toHaveLength(2);
    expect(result.paidCount).toBe(1);
    expect(result.unpaidCount).toBe(1);
  });

  it("getEventPaymentSummary handles attendee string ids", () => {
    setPaymentStatus("e2", "u3", "paid");

    const result = getEventPaymentSummary("e2", ["u3", "u4"]);

    expect(result.rows[0].status).toBe("paid");
    expect(result.rows[1].status).toBe("unpaid");
  });

  it("getEventPaymentSummary handles unknown attendee shape", () => {
    const result = getEventPaymentSummary("e3", [{}]);
    expect(result.rows[0].userId).toBe("unknown");
    expect(result.rows[0].status).toBe("unpaid");
  });

  it("stores payment notifications", () => {
    addPaymentNotification("e1", "u1", "paid", "Event 1");
    const items = getPaymentNotifications();

    expect(items).toHaveLength(1);
    expect(items[0].eventId).toBe("e1");
    expect(items[0].timestamp).toBe(1700000000000);
  });

  it("filters payment notifications by event", () => {
    addPaymentNotification("e1", "u1", "paid");
    addPaymentNotification("e2", "u2", "unpaid");

    const filtered = getPaymentNotifications("e2");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].eventId).toBe("e2");
  });

  it("caps notifications at 50", () => {
    for (let i = 0; i < 55; i += 1) {
      addPaymentNotification(`e${i}`, `u${i}`, "paid");
    }

    const all = getPaymentNotifications();
    expect(all.length).toBe(50);
  });

  it("keeps latest notification at top", () => {
    addPaymentNotification("e-old", "u1", "paid");
    addPaymentNotification("e-new", "u2", "unpaid");

    const all = getPaymentNotifications();
    expect(all[0].eventId).toBe("e-new");
  });

  it("clearPaymentStatus on unknown event is no-op", () => {
    expect(() => clearPaymentStatus("missing", "u1")).not.toThrow();
  });

  it("returns empty notifications when none", () => {
    expect(getPaymentNotifications()).toEqual([]);
  });
});
