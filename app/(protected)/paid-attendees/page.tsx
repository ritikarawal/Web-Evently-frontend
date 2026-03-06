import React, { useEffect, useState } from "react";
import { getEventPaymentSummary } from "@/lib/paymentStatus";

interface Attendee {
  userId: string;
  name: string;
  status: "paid" | "unpaid";
}

interface PaymentSummary {
  rows: Attendee[];
  paidCount: number;
  unpaidCount: number;
}

interface Props {
  eventId: string;
  attendees: any[];
}

const PaidAttendeesPage: React.FC<Props> = ({ eventId, attendees }) => {
  const [summary, setSummary] = useState<PaymentSummary>({ rows: [], paidCount: 0, unpaidCount: 0 });

  useEffect(() => {
    if (eventId && Array.isArray(attendees)) {
      const result = getEventPaymentSummary(eventId, attendees);
      setSummary(result);
    }
  }, [eventId, attendees]);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Paid Attendees</h1>
      <div className="mb-6">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 mr-2">
          Paid: {summary.paidCount}
        </span>
        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
          Unpaid: {summary.unpaidCount}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summary.rows.filter(row => row.status === "paid").map(row => (
          <div key={row.userId} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow">
            <span className="text-base font-medium text-slate-800">{row.name}</span>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
              Paid
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaidAttendeesPage;
