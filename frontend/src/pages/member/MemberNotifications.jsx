import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
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

const typeLabel = (type) => {
  const labels = {
    booking_requested: "Booking Request",
    booking_approved: "Booking Approved",
    booking_rejected: "Booking Rejected",
    booking_cancelled: "Booking Cancelled",
    wallet: "Wallet",
    system: "System",
  };

  return labels[type] || "Notification";
};

const typeClass = (type) => {
  if (type === "booking_approved") return "bg-emerald-400/10 text-emerald-300";
  if (type === "booking_rejected") return "bg-red-500/10 text-red-300";
  if (type === "booking_cancelled") return "bg-orange-400/10 text-orange-300";
  if (type === "booking_requested") return "bg-yellow-300/10 text-yellow-200";
  return "bg-white/10 text-white";
};

export default function MemberNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/notifications/my");

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/notifications/${notificationId}/read`);

      setSuccess(response.data.message || "Notification marked as read.");
      await fetchNotifications();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to update notification."
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch("/notifications/read-all");

      setSuccess(response.data.message || "All notifications marked as read.");
      await fetchNotifications();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to update notifications."
      );
    }
  };

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Notifications</h1>
          <p className="mt-2 text-slate-400">
            View booking updates, approval status and system alerts.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 rounded-2xl bg-yellow-300 px-5 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark all read
          </button>
        </div>
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

      <div className="mb-6 grid gap-5 md:grid-cols-3">
        <PremiumCard>
          <Bell className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Total Notifications</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {notifications.length}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Clock className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Unread</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {unreadCount}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <CalendarDays className="mb-4 h-8 w-8 text-yellow-200" />
          <p className="text-sm text-slate-400">Booking Updates</p>
          <h2 className="mt-2 text-3xl font-black text-white">
            {
              notifications.filter((item) =>
                String(item.type || "").startsWith("booking")
              ).length
            }
          </h2>
        </PremiumCard>
      </div>

      <PremiumCard>
        <div className="mb-5">
          <h2 className="text-xl font-black text-white">
            Notification Center
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Latest updates from your booking and workspace activity.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-14 text-slate-300">
            <Loader2 className="mr-3 h-5 w-5 animate-spin text-yellow-200" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            No notifications found.
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`rounded-3xl border p-5 transition ${
                  notification.isRead
                    ? "border-white/10 bg-white/5"
                    : "border-yellow-300/30 bg-yellow-300/10"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/40">
                      <Bell className="h-5 w-5 text-yellow-200" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-white">
                          {notification.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${typeClass(
                            notification.type
                          )}`}
                        >
                          {typeLabel(notification.type)}
                        </span>

                        {!notification.isRead && (
                          <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-black">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {notification.message}
                      </p>

                      {notification.bookingId && (
                        <div className="mt-4 rounded-2xl bg-black/30 p-4">
                          <p className="text-xs font-bold uppercase tracking-wide text-yellow-200">
                            Related Booking
                          </p>

                          <p className="mt-1 text-sm text-slate-300">
                            {notification.bookingId?.roomId?.name || "Room"} •{" "}
                            {notification.bookingId?.bookingDate || "-"} •{" "}
                            {notification.bookingId?.startTime || "-"} -{" "}
                            {notification.bookingId?.endTime || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Status: {notification.bookingId?.status || "-"} •
                            Amount: ₹{notification.bookingId?.amount || 0}
                          </p>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </AnimatedPage>
  );
}