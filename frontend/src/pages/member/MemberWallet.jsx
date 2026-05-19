import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  IndianRupee,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
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

export default function MemberWallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/wallet/my");

      setBalance(response.data.balance || 0);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load wallet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading wallet...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">My Wallet</h1>
          <p className="mt-2 text-slate-400">
            View your BeUnicorn wallet balance and credit/debit history.
          </p>
        </div>

        <button
          onClick={fetchWallet}
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

      <div className="grid gap-5 md:grid-cols-3">
        <PremiumCard className="md:col-span-2">
          <Wallet className="mb-5 h-10 w-10 text-yellow-200" />
          <p className="text-sm text-slate-400">Available Wallet Balance</p>
          <h2 className="mt-3 text-5xl font-black text-white">
            ₹{Number(balance || 0).toLocaleString("en-IN")}
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            This balance is calculated from immutable wallet transactions.
          </p>
        </PremiumCard>

        <PremiumCard>
          <CalendarDays className="mb-5 h-10 w-10 text-yellow-200" />
          <p className="text-sm text-slate-400">Total Transactions</p>
          <h2 className="mt-3 text-5xl font-black text-white">
            {transactions.length}
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Credits, debits, booking charges and refunds.
          </p>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <div className="mb-5">
          <h2 className="text-xl font-black text-white">
            Wallet Transaction History
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Every wallet action is recorded as a separate immutable entry.
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            No wallet transactions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const isCredit = transaction.direction === "credit";

              return (
                <div
                  key={transaction._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
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

                        {transaction.reason && (
                          <p className="mt-1 text-xs text-slate-500">
                            Reason: {transaction.reason}
                          </p>
                        )}

                        {transaction.bookingId && (
                          <p className="mt-2 text-xs text-yellow-200">
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
    </AnimatedPage>
  );
}