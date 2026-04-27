import { useState, useEffect } from "react";
import {
  TrendingUp, Wallet, Clock, CheckCircle2, ChevronDown, ChevronUp,
  Download, X, Loader2, AlertTriangle, Info, Building, CreditCard, User,
  ArrowDownCircle, BarChart3, Receipt, ShieldCheck, Lock
} from "lucide-react";
import { courseService } from "../../../services/courseService";

function formatNGN(amount: number) {
  return `₦${Number(amount).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  paid: "bg-blue-100 text-blue-700",
};

export default function TutorFinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "purchases" | "withdrawals">("overview");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const finData = await courseService.getTutorFinanceData();
      setData(finData);
      if (finData?.bankDetails) {
        setBankName(finData.bankDetails.bank_name || "");
        setAccountNumber(finData.bankDetails.bank_account_number || "");
        setAccountName(finData.bankDetails.bank_account_name || "");
      }
    } catch (err) {
      console.error("Finance data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) return setSubmitError("Please enter a valid amount.");
    if (amount > (data?.availableForWithdrawal || 0) - (data?.pendingWithdrawal || 0)) {
      return setSubmitError(`Maximum withdrawable amount is ${formatNGN((data?.availableForWithdrawal || 0) - (data?.pendingWithdrawal || 0))}.`);
    }
    try {
      setSubmitting(true);
      setSubmitError(null);
      await courseService.submitWithdrawalRequest({ amount, bank_name: bankName, account_number: accountNumber, account_name: accountName });
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowWithdrawModal(false);
        setSubmitSuccess(false);
        loadData();
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const netAvailable = Math.max(0, (data?.availableForWithdrawal || 0) - (data?.pendingWithdrawal || 0));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance & Earnings</h1>
          <p className="text-muted-foreground text-sm mt-1">Track your revenue, purchases, and payment requests</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-200"
        >
          <ArrowDownCircle className="w-4 h-4" />
          Request Withdrawal
        </button>
      </div>

      {/* Revenue Split Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-2xl p-5 text-white flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm mb-0.5">InternConnect Revenue Split Policy</p>
          <p className="text-blue-100 text-xs leading-relaxed">
            You earn <strong className="text-white">65%</strong> of each course sale. InternConnect retains 35%. Of your 65%, <strong className="text-white">70%</strong> is available for immediate withdrawal and the remaining <strong className="text-white">30% is held back</strong> until successful programme completion (per your Tutor Agreement).
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Course Sales", value: formatNGN(data?.totalRevenue || 0), icon: BarChart3, color: "blue", sub: "Gross revenue" },
          { label: "Your 65% Earnings", value: formatNGN(data?.totalTutorEarnings || 0), icon: TrendingUp, color: "emerald", sub: "After platform fee" },
          { label: "Available to Withdraw", value: formatNGN(netAvailable), icon: Wallet, color: "violet", sub: "70% disbursable" },
          { label: "Held Back (30%)", value: formatNGN(data?.heldBack || 0), icon: Lock, color: "amber", sub: "Released on completion" },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <p className="text-muted-foreground text-xs font-medium mt-0.5">{label}</p>
            <p className="text-muted-foreground/70 text-[11px] mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Pending / Paid Withdrawal Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-foreground font-bold">{formatNGN(data?.pendingWithdrawal || 0)}</p>
            <p className="text-muted-foreground text-xs">Pending Withdrawal</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-foreground font-bold">{formatNGN(data?.totalWithdrawn || 0)}</p>
            <p className="text-muted-foreground text-xs">Total Paid Out</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-1">
        {[
          { id: "overview", label: "Overview", icon: BarChart3 },
          { id: "purchases", label: "Purchase History", icon: Receipt },
          { id: "withdrawals", label: "Withdrawals", icon: Wallet },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-all -mb-px ${
              activeTab === id ? "border-blue-700 text-blue-700 font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* TAB: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <h3 className="text-foreground font-semibold">Recent Purchases</h3>
          {!data?.purchases?.length ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No purchases yet. Your earnings will appear here once students enroll.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Student</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Course</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Sale Price</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Your Share (65%)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purchases.slice(0, 5).map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{p.student?.full_name || "Unknown"}</p>
                        <p className="text-muted-foreground text-xs">{p.student?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">{p.course?.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">{formatNGN(p.amount_paid)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatNGN(p.tutor_share)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Full Purchase History */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-semibold">All Purchases ({data?.purchases?.length || 0})</h3>
          </div>
          {!data?.purchases?.length ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No purchase records found.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Student</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Course</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Sale Price</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Your 65%</th>
                  </tr>
                </thead>
                <tbody>
                  {data.purchases.map((p: any) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{p.student?.full_name || "Unknown"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.student?.email}</td>
                      <td className="px-4 py-3 text-foreground">{p.course?.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">{formatNGN(p.amount_paid)}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatNGN(p.tutor_share)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Withdrawals */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-foreground font-semibold">Withdrawal Requests</h3>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center gap-2 text-sm bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              <ArrowDownCircle className="w-4 h-4" /> New Request
            </button>
          </div>
          {!data?.withdrawals?.length ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
              <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No withdrawal requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.withdrawals.map((w: any) => (
                <div key={w.id} className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColors[w.status] || "bg-muted text-muted-foreground"}`}>
                        {w.status.toUpperCase()}
                      </span>
                      <span className="text-muted-foreground text-xs">{formatDate(w.created_at)}</span>
                    </div>
                    <p className="text-foreground font-bold text-lg">{formatNGN(w.amount)}</p>
                    <p className="text-muted-foreground text-xs">{w.bank_name} · {w.account_number} · {w.account_name}</p>
                    {w.admin_note && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{w.admin_note}</p>
                    )}
                  </div>
                  {w.status === "approved" && (
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Approved
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowWithdrawModal(false)}>
          <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground font-bold text-lg">Request Withdrawal</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Available: <strong className="text-emerald-600">{formatNGN(netAvailable)}</strong></p>
              </div>
              <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Revenue split reminder */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Revenue Split Reminder</p>
                <p>You can withdraw up to <strong>70%</strong> of your 65% earnings now. The remaining 30% is held until programme completion.</p>
              </div>
            </div>

            {submitSuccess ? (
              <div className="py-6 flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="font-bold text-foreground">Request Submitted!</p>
                <p className="text-muted-foreground text-sm">Your withdrawal request is now pending admin review.</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Amount (₦)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: ${formatNGN(netAvailable)}`}
                    max={netAvailable}
                    min={1}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Bank Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. Access Bank" className="w-full border border-border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Account Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))} maxLength={10} placeholder="0123456789" className="w-full border border-border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Account Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="As it appears on your bank account" className="w-full border border-border rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600" required />
                  </div>
                </div>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />{submitError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Request"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
