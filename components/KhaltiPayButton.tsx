"use client";

import { useEffect } from "react";
import { getKhaltiConfig } from "../lib/khalti";
import { addPaymentNotification, setPaymentStatus } from "@/lib/paymentStatus";

declare global {
  interface Window {
    KhaltiCheckout: any;
  }
}

const getCookieValue = (name: string) => {
  if (typeof document === "undefined") return null;
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (const rawCookie of cookies) {
    const cookie = rawCookie.trim();
    if (cookie.startsWith(nameEQ)) {
      const value = cookie.substring(nameEQ.length);
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
};

export function KhaltiPayButton({ event }: { event: any }) {
  useEffect(() => {
    if (!window.KhaltiCheckout) {
      const script = document.createElement('script');
      script.src = 'https://khalti.com/static/khalti-checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = () => {
    if (!window.KhaltiCheckout) {
      alert('Khalti SDK not loaded. Please try again.');
      return;
    }
    const config = getKhaltiConfig({
      productIdentity: event._id,
      productName: event.title,
      amount: (event.ticketPrice || 0) * 100,
      onSuccess: (payload: any) => {
        alert('Payment successful! Reference: ' + payload.idx);
        const userDataRaw = getCookieValue("user_data");
        if (userDataRaw) {
          try {
            const parsed = JSON.parse(userDataRaw) as { _id?: string };
            if (parsed?._id) {
              setPaymentStatus(String(event._id), String(parsed._id), "paid");
              addPaymentNotification(String(event._id), String(parsed._id), "paid", event.title);
            }
          } catch {
            // ignore invalid cookie payload
          }
        }
      },
      onError: (err: any) => {
        alert('Payment failed!');
      },
    });
    const checkout = new window.KhaltiCheckout(config);
    checkout.show({ amount: (event.ticketPrice || 0) * 100 });
  };

  return (
    <button
      onClick={handlePay}
      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm border-2 border-purple-700 shadow-md hover:bg-purple-700 transition-all"
    >
      Pay with Khalti
    </button>
  );
}