import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "https://bilreminder-4.onrender.com/api/bill";

function dueBadge(d) {
  const t = new Date(); t.setHours(0,0,0,0);
  const due = new Date(d.split("T")[0]); due.setHours(0,0,0,0);
  const diff = Math.floor((due - t) / 86400000);
  const abs = Math.abs(diff), mo = Math.floor(abs / 30);
  if (diff < 0) return mo >= 1 ? `${mo} mo overdue` : `${abs} day${abs !== 1 ? "s" : ""} overdue`;
  if (diff === 0) return "Due today";
  return mo >= 1 ? `in ${mo} mo` : `in ${diff} day${diff !== 1 ? "s" : ""}`;
}

function Badge({ label }) {
  const base = "text-xs font-semibold px-2.5 py-0.5 rounded-full";
  if (label.includes("overdue")) return <span className={`${base} bg-red-50 text-red-600`}>{label}</span>;
  if (label === "Due today") return <span className={`${base} bg-amber-50 text-amber-600`}>{label}</span>;
  return <span className={`${base} bg-green-50 text-green-700`}>{label}</span>;
}

const sf = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" };

export default function App() {
  const [bills, setBills] = useState([]);
  const [form, setForm] = useState({ name: "", amount: "", dueDate: "" });

  useEffect(() => { axios.get(API).then(r => setBills(r.data)).catch(console.error); }, []);
  const refresh = () => axios.get(API).then(r => setBills(r.data)).catch(console.error);

  const handleSubmit = async () => {
    if (!form.name || !form.amount || !form.dueDate) return;
    await axios.post(API, { ...form, amount: Number(form.amount) }).catch(console.error);
    setForm({ name: "", amount: "", dueDate: "" });
    refresh();
  };

  const fmtDate = (d) => new Date(d.split("T")[0]).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="px-10 py-12" style={sf}>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Bill Tracker</h1>
        {bills.length > 0 && <span className="text-sm text-gray-400 pb-1">{bills.length} bill{bills.length !== 1 ? "s" : ""}</span>}
      </div>

      {/* Inline form bar */}
      <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-end bg-white border border-gray-100 rounded-2xl px-6 py-5 mb-8">
        {[
          { label: "Bill name", id: "name", type: "text", placeholder: "e.g. Electricity" },
          { label: "Amount (₹)", id: "amount", type: "number", placeholder: "0" },
          { label: "Due date", id: "dueDate", type: "date", placeholder: "" },
        ].map(f => (
          <div key={f.id} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">{f.label}</label>
            <input type={f.type} value={form[f.id]} placeholder={f.placeholder}
              onChange={e => setForm({ ...form, [f.id]: e.target.value })}
              className="border-0 border-b border-gray-200 focus:border-blue-500 bg-transparent text-sm text-gray-900 pb-1.5 outline-none transition-colors placeholder-gray-300" />
          </div>
        ))}
        <button onClick={handleSubmit}
          className="self-end px-5 py-2.5 bg-blue-500 hover:bg-blue-600 active:scale-[.97] text-white text-sm font-semibold rounded-xl transition-all whitespace-nowrap">
          Add bill
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Name", "Amount", "Due date", "Status", "Penalty"].map((h, i) => (
              <th key={h} className={`text-xs font-semibold uppercase tracking-wider text-gray-400 pb-3 px-4 text-left ${i === 4 ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bills.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-sm text-gray-300 py-12">No bills yet — add one above</td></tr>
          ) : bills.map(b => (
            <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-4 text-sm font-medium text-gray-900">{b.name}</td>
              <td className="px-4 py-4 text-sm text-gray-500">₹{Number(b.amount).toLocaleString("en-IN")}</td>
              <td className="px-4 py-4 text-sm text-gray-500">{fmtDate(b.dueDate)}</td>
              <td className="px-4 py-4"><Badge label={dueBadge(b.dueDate)} /></td>
              <td className="px-4 py-4 text-sm text-gray-500 text-right">₹{b.penalty ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}