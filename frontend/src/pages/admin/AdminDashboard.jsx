import {
  Building2,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Loader2,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const statusClass = (status) => {
  if (status === "confirmed") return "bg-emerald-400/10 text-emerald-300";
  if (status === "pending") return "bg-yellow-300/10 text-yellow-200";
  if (status === "rejected") return "bg-red-500/10 text-red-300";
  if (status === "cancelled") return "bg-slate-500/10 text-slate-300";
  if (status === "active") return "bg-emerald-400/10 text-emerald-300";
  if (status === "blocked") return "bg-red-500/10 text-red-300";
  return "bg-white/10 text-white";
};

const formatType = (type) => {
  return String(type || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [walletStats, setWalletStats] = useState({
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [statsRes, usersRes, bookingsRes, walletRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/bookings"),
        api.get("/wallet/admin/transactions"),
      ]);

      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
      setBookings(bookingsRes.data.bookings || []);
      setWalletStats({
        totalCredit: walletRes.data.totalCredit || 0,
        totalDebit: walletRes.data.totalDebit || 0,
        netBalance: walletRes.data.netBalance || 0,
        transactions: walletRes.data.transactions || [],
      });
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading admin analytics...
        </div>
      </AnimatedPage>
    );
  }

  const statCards = [
    {
      label: "Registered Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      sub: "Total accounts",
      link: "/admin/users",
    },
    {
      label: "Active Rooms",
      value: stats?.totalRooms || 0,
      icon: Building2,
      sub: "Bookable spaces",
      link: "/admin/rooms",
    },
    {
      label: "Pending Bookings",
      value: stats?.pendingBookings || 0,
      icon: CalendarDays,
      sub: "Waiting approval",
      link: "/admin/bookings",
    },
    {
      label: "Confirmed Bookings",
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle2,
      sub: "Approved bookings",
      link: "/admin/bookings",
    },
    {
      label: "Booking Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      sub: "Confirmed bookings",
      link: "/admin/bookings",
    },
    {
      label: "Wallet Net Balance",
      value: `₹${Number(walletStats.netBalance || 0).toLocaleString("en-IN")}`,
      icon: Wallet,
      sub: "Credit minus debit",
      link: "/admin/wallet",
    },
  ];

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-bold text-yellow-200">
            BeUnicorn Admin Console
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-slate-400">
            Monitor users, rooms, bookings, revenue, and wallet ledger activity.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.label} to={card.link}>
              <PremiumCard>
                <Icon className="mb-4 h-8 w-8 text-yellow-200" />
                <p className="text-sm text-slate-400">{card.label}</p>
                <h2 className="mt-2 text-3xl font-black text-white">
                  {card.value}
                </h2>
                <p className="mt-2 text-xs text-slate-500">{card.sub}</p>
              </PremiumCard>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PremiumCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Recent Registered Users
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest member/admin registrations.
              </p>
            </div>

            <Link
              to="/admin/users"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              View All
            </Link>
          </div>

          {users.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No users found.
            </div>
          ) : (
            <div className="space-y-4">
              {users.slice(0, 6).map((user) => (
                <div
                  key={user.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <h3 className="font-black text-white">{user.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.companyName || "No company"} • Joined{" "}
                        {formatDateTime(user.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-200">
                        {user.role}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          user.status
                        )}`}
                      >
                        {user.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>

        <PremiumCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Recent Bookings
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest booking requests and approvals.
              </p>
            </div>

            <Link
              to="/admin/bookings"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              View All
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No bookings found.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 6).map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div>
                      <h3 className="font-black text-white">
                        {booking.roomId?.name || "Room"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {booking.userId?.name || "User"} •{" "}
                        {booking.userId?.email || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {booking.bookingDate} • {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                      <p className="mt-2 text-lg font-black text-yellow-200">
                        ₹{booking.amount}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">
              Recent Wallet Ledger Activity
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Latest credits, debits, booking charges, and refunds.
            </p>
          </div>

          <Link
            to="/admin/wallet"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            View Wallet
          </Link>
        </div>

        {walletStats.transactions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            No wallet transactions found.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {walletStats.transactions.slice(0, 8).map((transaction) => {
              const isCredit = transaction.direction === "credit";

              return (
                <div
                  key={transaction._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-black text-white">
                        {formatType(transaction.type)}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {transaction.userId?.name || "User"} •{" "}
                        {transaction.userId?.email || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {transaction.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(transaction.createdAt)}
                      </p>
                    </div>

                    <p
                      className={`text-xl font-black ${
                        isCredit ? "text-emerald-300" : "text-red-300"
                      }`}
                    >
                      {isCredit ? "+" : "-"}₹
                      {Number(transaction.amount || 0).toLocaleString("en-IN")}
                    </p>
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