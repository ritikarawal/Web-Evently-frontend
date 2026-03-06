"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { addPaymentNotification, setPaymentStatus } from "@/lib/paymentStatus";

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

export default function PaymentsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [selectedMethod, setSelectedMethod] = useState("khalti");
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState(false);

  const eventId = params.get("eventId") || "";
  const eventTitle = params.get("title") || "Event";
  const amount = params.get("amount") || "0";

  const userId = useMemo(() => {
    const userDataRaw = getCookieValue("user_data");
    if (!userDataRaw) return "";
    try {
      const parsed = JSON.parse(userDataRaw) as { _id?: string };
      return parsed?._id || "";
    } catch {
      return "";
    }
  }, []);

  const handlePay = async () => {
    if (!eventId || !userId) return;
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPaymentStatus(eventId, userId, "paid");
    addPaymentNotification(eventId, userId, "paid", eventTitle);
    setPaid(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600">Payment</p>
              <h1 className="text-3xl font-black text-slate-900">Complete your payment</h1>
              <p className="text-sm text-slate-600 mt-1">{eventTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase text-slate-400">Total</p>
              <p className="text-2xl font-bold text-slate-900">${amount}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "khalti", label: "Khalti Wallet", desc: "Fast wallet payment" },
              { key: "qr", label: "QR Code", desc: "Scan & pay" },
              { key: "card", label: "Card", desc: "Visa / MasterCard" },
              { key: "cash", label: "Cash", desc: "Pay at venue" }
            ].map((method) => (
              <button
                key={method.key}
                type="button"
                onClick={() => setSelectedMethod(method.key)}
                className={`rounded-xl border p-4 text-left transition-all ${
                  selectedMethod === method.key
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{method.label}</p>
                <p className="text-xs text-slate-500">{method.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 p-6 text-center">
            <p className="text-sm font-semibold text-emerald-700">Payment Preview</p>
            <div className="mt-4 mx-auto h-32 w-32 rounded-xl bg-white shadow-inner flex items-center justify-center text-5xl">
              {selectedMethod === "qr" ? "#" : "$$"}
            </div>
            <p className="mt-3 text-xs text-emerald-700">Use the selected method to finish payment.</p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Pay Later
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={submitting || paid || !eventId || !userId}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all ${
                paid
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              } ${submitting ? "opacity-70" : ""}`}
            >
              {paid ? "Payment Successful" : submitting ? "Processing..." : "Confirm Payment"}
            </button>
          </div>

          {paid && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Payment saved. The organizer will see your status as paid.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
