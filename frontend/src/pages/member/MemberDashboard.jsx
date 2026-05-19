import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";
import { getMemberUser } from "../../utils/auth";

const statusClass = (status) => {
  if (status === "confirmed") return "bg-emerald-400/10 text-emerald-300";
  if (status === "pending") return "bg-yellow-300/10 text-yellow-200";
  if (status === "rejected") return "bg-red-500/10 text-red-300";
  if (status === "cancelled") return "bg-slate-500/10 text-slate-300";
  return "bg-white/10 text-white";
};

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

export default function MemberDashboard() {
  const user = getMemberUser();

  const [walletBalance, setWalletBalance] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [walletRes, bookingsRes, notificationsRes] = await Promise.all([
        api.get("/wallet/my"),
        api.get("/bookings/my"),
        api.get("/notifications/my"),
      ]);

      setWalletBalance(walletRes.data.balance || 0);
      setBookings(bookingsRes.data.bookings || []);
      setNotifications((notificationsRes.data.notifications || []).slice(0, 5));
      setUnreadCount(notificationsRes.data.unreadCount || 0);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((item) => item.status === "pending").length,
      confirmed: bookings.filter((item) => item.status === "confirmed").length,
      cancelled: bookings.filter((item) => item.status === "cancelled").length,
      rejected: bookings.filter((item) => item.status === "rejected").length,
    };
  }, [bookings]);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading member dashboard...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-bold text-yellow-200">
            BeUnicorn Member Portal
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Welcome, {user?.name || "Member"}
          </h1>
          <p className="mt-2 text-slate-400">
            Manage bookings, wallet balance, and workspace updates.
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <PremiumCard className="xl:col-span-2">
          <Wallet className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Wallet Balance</p>
          <h2 className="mt-2 text-4xl font-black text-white">
            ₹{Number(walletBalance || 0).toLocaleString("en-IN")}
          </h2>
          <Link
            to="/member/wallet"
            className="mt-5 inline-block rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-black"
          >
            View Wallet
          </Link>
        </PremiumCard>

        <PremiumCard>
          <CalendarDays className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Total Bookings</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {stats.total}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Clock className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Pending</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {stats.pending}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <CheckCircle2 className="mb-4 h-8 w-8 text-emerald-300" />
          <p className="text-sm text-slate-400">Confirmed</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {stats.confirmed}
          </h2>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PremiumCard>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                Recent Bookings
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest booking requests and status.
              </p>
            </div>

            <Link
              to="/member/bookings"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              View All
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No bookings yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-white">
                        {booking.roomId?.name || "Room"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {booking.bookingDate} • {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>
                      <p className="mt-1 text-sm text-yellow-200">
                        ₹{booking.amount}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
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
                Recent Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                You have {unreadCount} unread notification
                {unreadCount === 1 ? "" : "s"}.
              </p>
            </div>

            <Link
              to="/member/notifications"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
            >
              View All
            </Link>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No notifications yet.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`rounded-3xl border p-4 ${
                    notification.isRead
                      ? "border-white/10 bg-white/5"
                      : "border-yellow-300/30 bg-yellow-300/10"
                  }`}
                >
                  <div className="flex gap-3">
                    <Bell className="mt-1 h-5 w-5 shrink-0 text-yellow-200" />
                    <div>
                      <h3 className="font-black text-white">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Link to="/member/bookings">
          <PremiumCard>
            <CalendarDays className="mb-4 h-8 w-8 text-yellow-200" />
            <h3 className="text-xl font-black text-white">Book a Space</h3>
            <p className="mt-2 text-sm text-slate-400">
              Browse meeting rooms, studios, cabins and workspaces.
            </p>
          </PremiumCard>
        </Link>

        <Link to="/member/wallet">
          <PremiumCard>
            <IndianRupee className="mb-4 h-8 w-8 text-yellow-200" />
            <h3 className="text-xl font-black text-white">Wallet Ledger</h3>
            <p className="mt-2 text-sm text-slate-400">
              Track credits, booking deductions and refunds.
            </p>
          </PremiumCard>
        </Link>

        <Link to="/member/notifications">
          <PremiumCard>
            <XCircle className="mb-4 h-8 w-8 text-yellow-200" />
            <h3 className="text-xl font-black text-white">Updates</h3>
            <p className="mt-2 text-sm text-slate-400">
              View approval, rejection and cancellation updates.
            </p>
          </PremiumCard>
        </Link>
      </div>
    </AnimatedPage>
  );
}