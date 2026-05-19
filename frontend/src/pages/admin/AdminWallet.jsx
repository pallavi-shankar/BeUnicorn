import {
  ArrowDownCircle,
  ArrowUpCircle,
  IndianRupee,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";

const formatDateTime = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatType = (type) => {
  return String(type || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminWallet() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    direction: "credit",
    amount: "",
    reason: "",
  });

  const [stats, setStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
  });

  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchWalletAdminData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [usersRes, walletRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/wallet/admin/transactions"),
      ]);

      const onlyMembers = (usersRes.data.users || []).filter(
        (user) => user.role !== "admin" && user.role !== "cabin_admin"
      );

      setUsers(onlyMembers);
      setTransactions(walletRes.data.transactions || []);
      setStats({
        totalCredit: walletRes.data.totalCredit || 0,
        totalDebit: walletRes.data.totalDebit || 0,
        netBalance: walletRes.data.netBalance || 0,
      });

      if (!selectedUserId && onlyMembers.length > 0) {
        setSelectedUserId(onlyMembers[0].id || onlyMembers[0]._id);
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load wallet admin data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletAdminData();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return users;

    return users.filter((user) => {
      return (
        String(user.name || "").toLowerCase().includes(term) ||
        String(user.email || "").toLowerCase().includes(term) ||
        String(user.companyName || "").toLowerCase().includes(term)
      );
    });
  }, [search, users]);

  const selectedUser = users.find(
    (user) => String(user.id || user._id) === String(selectedUserId)
  );

  const handleAdjustWallet = async (e) => {
    e.preventDefault();

    try {
      setAdjusting(true);
      setMessage("");
      setSuccess("");

      if (!selectedUserId || !form.direction || !form.amount || !form.reason) {
        setMessage("Please select user, amount, direction and reason.");
        return;
      }

      const response = await api.post("/wallet/admin/adjust", {
        userId: selectedUserId,
        direction: form.direction,
        amount: Number(form.amount),
        reason: form.reason,
      });

      setSuccess(response.data.message || "Wallet updated successfully.");

      setForm({
        direction: "credit",
        amount: "",
        reason: "",
      });

      await fetchWalletAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Wallet adjustment failed.");
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading admin wallet...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">
            Admin Wallet Management
          </h1>
          <p className="mt-2 text-slate-400">
            Grant credits, debit wallet, and view complete wallet ledger.
          </p>
        </div>

        <button
          onClick={fetchWalletAdminData}
          className="flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
          {message}
        </div>
      )}

      {success && (
        <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {success}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <PremiumCard>
          <ArrowUpCircle className="mb-4 h-8 w-8 text-emerald-300" />
          <p className="text-sm text-slate-400">Total Credits</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            ₹{Number(stats.totalCredit || 0).toLocaleString("en-IN")}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <ArrowDownCircle className="mb-4 h-8 w-8 text-red-300" />
          <p className="text-sm text-slate-400">Total Debits</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            ₹{Number(stats.totalDebit || 0).toLocaleString("en-IN")}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <IndianRupee className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Net Wallet Balance</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            ₹{Number(stats.netBalance || 0).toLocaleString("en-IN")}
          </h2>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <Wallet className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">
              Adjust Member Wallet
            </h2>
          </div>

          <form onSubmit={handleAdjustWallet} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member"
                className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none"
            >
              <option value="">Select member</option>
              {filteredUsers.map((user) => (
                <option key={user.id || user._id} value={user.id || user._id}>
                  {user.name} - {user.email}
                </option>
              ))}
            </select>

            {selectedUser && (
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm font-bold text-white">
                  {selectedUser.name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedUser.email}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedUser.companyName || "No company"}
                </p>
              </div>
            )}

            <select
              value={form.direction}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, direction: e.target.value }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-white outline-none"
            >
              <option value="credit">Credit wallet</option>
              <option value="debit">Debit wallet</option>
            </select>

            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="Amount"
              className="w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Reason is mandatory"
              className="h-24 w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={adjusting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {adjusting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {adjusting ? "Saving..." : "Save Wallet Adjustment"}
            </button>
          </form>
        </PremiumCard>

        <PremiumCard className="xl:col-span-2">
          <div className="mb-5">
            <h2 className="text-xl font-black text-white">
              Wallet Ledger History
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              All wallet credits, debits, booking deductions and refunds.
            </p>
          </div>

          {transactions.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
              No wallet transactions yet.
            </div>
          ) : (
            <div className="max-h-[680px] space-y-4 overflow-y-auto pr-1">
              {transactions.map((transaction) => {
                const isCredit = transaction.direction === "credit";

                return (
                  <div
                    key={transaction._id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div className="flex gap-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            isCredit
                              ? "bg-emerald-400/10"
                              : "bg-red-500/10"
                          }`}
                        >
                          {isCredit ? (
                            <ArrowUpCircle className="h-6 w-6 text-emerald-300" />
                          ) : (
                            <ArrowDownCircle className="h-6 w-6 text-red-300" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-black text-white">
                            {formatType(transaction.type)}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {transaction.description}
                          </p>

                          <p className="mt-2 text-sm text-yellow-200">
                            {transaction.userId?.name || "User"} •{" "}
                            {transaction.userId?.email || "-"}
                          </p>

                          {transaction.reason && (
                            <p className="mt-1 text-xs text-slate-500">
                              Reason: {transaction.reason}
                            </p>
                          )}

                          {transaction.bookingId && (
                            <p className="mt-1 text-xs text-slate-500">
                              Booking:{" "}
                              {transaction.bookingId?.roomId?.name || "Room"} •{" "}
                              {transaction.bookingId?.bookingDate || "-"}
                            </p>
                          )}

                          <p className="mt-2 text-xs text-slate-500">
                            {formatDateTime(transaction.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-2xl font-black ${
                            isCredit ? "text-emerald-300" : "text-red-300"
                          }`}
                        >
                          {isCredit ? "+" : "-"}₹
                          {Number(transaction.amount || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="mt-1 text-xs uppercase text-slate-500">
                          {transaction.direction}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PremiumCard>
      </div>
    </AnimatedPage>
  );
}