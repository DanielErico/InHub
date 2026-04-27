import { useState, useEffect, useCallback } from "react";
import {
  DollarSign, Receipt, Wallet, Download, CheckCircle, XCircle,
  Loader2, AlertTriangle, Clock, TrendingUp, BarChart3, Filter,
  ChevronDown, User, Mail, BookOpen, ArrowUpRight, Info
} from "lucide-react";
import { courseService } from "../../../../services/courseService";

function formatNGN(amount: number) {
  return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  paid: "bg-blue-100 text-blue-700 border-blue-200",
};

function downloadCSV(purchases: any[]) {
  const headers = ["Date", "Course", "Student Name", "Student Email", "Tutor Name", "Tutor Email", "Sale Price (NGN)", "Tutor Share 65% (NGN)", "Platform Share 35% (NGN)"];
  const rows = purchases.map(p => [
    formatDate(p.created_at),
    `"${p.course_title}"`,
    `"${p.student_name}"`,
    p.student_email,
    `"${p.tutor_name}"`,
    p.tutor_email,
    p.amount_paid,
    p.tutor_share.toFixed(2),
    p.platform_share.toFixed(2),
  ]);
  const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inhub_purchases_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"purchases" | "withdrawals">("purchases");
  const [purchases, setPurchases] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; tutorId: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pData, wData] = await Promise.all([
        courseService.adminGetAllPurchases(),
        courseService.adminGetAllWithdrawals(),
      ]);
      setPurchases(pData || []);
      setWithdrawals(wData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleApprove = async (withdrawalId: string, tutorId: string) => {
    try {
      setActionLoading(withdrawalId);
      await courseService.adminApproveWithdrawal(withdrawalId, tutorId);
      await loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      setActionLoading(rejectModal.id);
      await courseService.adminRejectWithdrawal(rejectModal.id, rejectNote);
      setRejectModal(null);
      setRejectNote("");
      await loadData();
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const totalRevenue = purchases.reduce((s, p) => s + Number(p.amount_paid || 0), 0);
  const totalPlatform = purchases.reduce((s, p) => s + Number(p.platform_share || 0), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === "pending");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Sales Revenue", value: formatNGN(totalRevenue), icon: TrendingUp, color: "blue" },
          { label: "Platform Revenue (35%)", value: formatNGN(totalPlatform), icon: DollarSign, color: "emerald" },
          { label: "Total Transactions", value: purchases.length, icon: Receipt, color: "violet" },
          { label: "Pending Withdrawals", value: pendingWithdrawals.length, icon: Clock, color: "amber" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm`}>
            <div className={`w-9 h-9 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Split Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start text-sm text-blue-800">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Revenue Policy (Per Tutor Agreement)</p>
          <p className="text-blue-700 text-xs leading-relaxed">
            InternConnect retains <strong>35%</strong> of all sales. Tutors receive <strong>65%</strong>.
            Of the tutor's 65%, only <strong>70% is disbursable</strong> upfront — the remaining <strong>30% is held back</strong> until successful programme completion.
            When approving a withdrawal, verify the requested amount does not exceed the tutor's 70% disbursable balance.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        {[
          { id: "purchases", label: "All Purchases", icon: Receipt },
          { id: "withdrawals", label: `Withdrawal Requests ${pendingWithdrawals.length > 0 ? `(${pendingWithdrawals.length} Pending)` : ""}`, icon: Wallet },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all -mb-px ${
              activeTab === id ? "border-blue-700 text-blue-700 font-semibold" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-blue-600 animate-spin" /></div>
      ) : activeTab === "purchases" ? (
        /* ---- Purchases Table ---- */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 text-sm">{purchases.length} transactions found</p>
            <button
              onClick={() => downloadCSV(purchases)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Export to Excel / CSV
            </button>
          </div>
          {!purchases.length ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No purchases recorded yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-auto shadow-sm">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Course</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Tutor</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Sale Price</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Tutor 65%</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">Platform 35%</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{p.course_title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.student_name}</p>
                        <p className="text-gray-400 text-xs">{p.student_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{p.tutor_name}</p>
                        <p className="text-gray-400 text-xs">{p.tutor_email}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">{formatNGN(p.amount_paid)}</td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatNGN(p.tutor_share)}</td>
                      <td className="px-4 py-3 text-right font-medium text-blue-600">{formatNGN(p.platform_share)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 font-bold text-gray-700">TOTALS</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">{formatNGN(totalRevenue)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatNGN(totalRevenue * 0.65)}</td>
                    <td className="px-4 py-3 text-right font-bold text-blue-600">{formatNGN(totalPlatform)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* ---- Withdrawal Requests ---- */
        <div className="space-y-3">
          {!withdrawals.length ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
              <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No withdrawal requests yet.</p>
            </div>
          ) : (
            withdrawals.map(w => (
              <div key={w.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusBadge[w.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {w.status.toUpperCase()}
                    </span>
                    <span className="text-gray-400 text-xs">{formatDate(w.created_at)}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatNGN(w.amount)}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /><strong>{w.tutor?.full_name}</strong></span>
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{w.tutor?.email}</span>
                  </div>
                  <div className="text-xs text-gray-500 pt-1 flex flex-wrap gap-3">
                    <span><strong>Bank:</strong> {w.bank_name}</span>
                    <span><strong>Account No:</strong> {w.account_number}</span>
                    <span><strong>Name:</strong> {w.account_name}</span>
                  </div>
                  {w.admin_note && (
                    <p className="text-red-600 text-xs flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3" /> {w.admin_note}</p>
                  )}
                </div>
                {w.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(w.id, w.tutor_id)}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {actionLoading === w.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModal({ id: w.id, tutorId: w.tutor_id })}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-gray-900 text-lg">Reject Withdrawal</h2>
            <p className="text-gray-500 text-sm">Provide a reason for rejection. This will be visible to the tutor.</p>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="e.g. Insufficient balance, incorrect bank details..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNote.trim() || !!actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
