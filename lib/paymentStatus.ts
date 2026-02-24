export type PaymentStatus = "paid" | "unpaid";

const STORAGE_KEY = "evently_payment_status_v1";
const NOTIFICATION_KEY = "evently_payment_notifications_v1";

type PaymentStore = Record<string, Record<string, PaymentStatus>>;

type PaymentNotification = {
  eventId: string;
  userId: string;
  status: PaymentStatus;
  timestamp: number;
  eventTitle?: string;
};

const readStore = (): PaymentStore => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as PaymentStore;
  } catch {
    return {};
  }
};

const writeStore = (store: PaymentStore) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const getPaymentStatus = (eventId: string, userId: string): PaymentStatus => {
  const store = readStore();
  return store?.[eventId]?.[userId] ?? "unpaid";
};

export const setPaymentStatus = (eventId: string, userId: string, status: PaymentStatus) => {
  const store = readStore();
  const eventEntry = store[eventId] || {};
  eventEntry[userId] = status;
  store[eventId] = eventEntry;
  writeStore(store);
};

export const clearPaymentStatus = (eventId: string, userId: string) => {
  const store = readStore();
  if (!store[eventId]) return;
  delete store[eventId][userId];
  writeStore(store);
};

export const getEventPaymentSummary = (
  eventId: string,
  attendees: Array<any> | undefined
) => {
  const rows = (attendees || []).map((attendee, index) => {
    const userId = typeof attendee === "string" ? attendee : attendee?._id || attendee?.id || "unknown";
    const name = attendee?.firstName || attendee?.lastName
      ? `${attendee?.firstName || ""} ${attendee?.lastName || ""}`.trim()
      : attendee?.username || attendee?.email || `Attendee ${index + 1}`;
    const status = userId !== "unknown" ? getPaymentStatus(eventId, String(userId)) : "unpaid";
    return { userId: String(userId), name, status };
  });

  const paidCount = rows.filter((row) => row.status === "paid").length;
  const unpaidCount = rows.length - paidCount;

  return { rows, paidCount, unpaidCount };
};

const readNotifications = (): PaymentNotification[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTIFICATION_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PaymentNotification[];
  } catch {
    return [];
  }
};

const writeNotifications = (items: PaymentNotification[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(items));
};

export const addPaymentNotification = (
  eventId: string,
  userId: string,
  status: PaymentStatus,
  eventTitle?: string
) => {
  const items = readNotifications();
  items.unshift({ eventId, userId, status, timestamp: Date.now(), eventTitle });
  writeNotifications(items.slice(0, 50));
};

export const getPaymentNotifications = (eventId?: string) => {
  const items = readNotifications();
  if (!eventId) return items;
  return items.filter((item) => item.eventId === eventId);
};
