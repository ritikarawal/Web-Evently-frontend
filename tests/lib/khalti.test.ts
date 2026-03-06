import { getKhaltiConfig, KHALTI_PUBLIC_KEY } from "@/lib/khalti";

describe("khalti config", () => {
  it("builds config with given values", () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const config = getKhaltiConfig({
      productIdentity: "event-1",
      productName: "Event Ticket",
      amount: 1000,
      onSuccess,
      onError,
    });

    expect(config.publicKey).toBe(KHALTI_PUBLIC_KEY);
    expect(config.productIdentity).toBe("event-1");
    expect(config.productName).toBe("Event Ticket");
    expect(config.eventHandler.onSuccess).toBe(onSuccess);
    expect(config.eventHandler.onError).toBe(onError);
    expect(config.paymentPreference).toContain("KHALTI");
  });

  it("sets productUrl to current location", () => {
    const config = getKhaltiConfig({
      productIdentity: "x",
      productName: "y",
      amount: 100,
      onSuccess: jest.fn(),
      onError: jest.fn(),
    });

    expect(config.productUrl).toBe(window.location.href);
  });
});
