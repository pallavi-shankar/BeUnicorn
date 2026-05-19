import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";

const formatRoomType = (type) => {
  return String(type || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

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

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    cancelled: 0,
    revenue: 0,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const calculateStats = (items) => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      confirmed: items.filter((item) => item.status === "confirmed").length,
      rejected: items.filter((item) => item.status === "rejected").length,
      cancelled: items.filter((item) => item.status === "cancelled").length,
      revenue: items
        .filter((item) => ["confirmed", "completed"].includes(item.status))
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    };
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/admin/bookings");
      const items = response.data.bookings || [];

      setBookings(items);
      setStats(calculateStats(items));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;

      const text = [
        booking.roomId?.name,
        booking.roomId?.type,
        booking.userId?.name,
        booking.userId?.email,
        booking.bookingDate,
        booking.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || text.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [bookings, statusFilter, search]);

  const handleApproveBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Approve this booking? Wallet balance will be checked and amount will be deducted."
    );

    if (!confirmed) return;

    try {
      setActionLoadingId(bookingId);
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/approve`);

      setSuccess(response.data.message || "Booking approved successfully.");
      await fetchBookings();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to approve booking.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRejectBooking = async (bookingId) => {
    const reason = window.prompt("Enter rejection reason:", "Slot not available");
    if (reason === null) return;

    try {
      setActionLoadingId(bookingId);
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/reject`, {
        reason,
      });

      setSuccess(response.data.message || "Booking rejected successfully.");
      await fetchBookings();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to reject booking.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm("Cancel this booking?");
    if (!confirmed) return;

    const reason =
      window.prompt("Enter cancellation reason:", "Cancelled by admin") ||
      "Cancelled by admin";

    try {
      setActionLoadingId(bookingId);
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/cancel`, {
        reason,
      });

      setSuccess(response.data.message || "Booking cancelled successfully.");
      await fetchBookings();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading booking approvals...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">
            Booking Approvals
          </h1>
          <p className="mt-2 text-slate-400">
            Review member booking requests, approve after wallet check, reject,
            or cancel bookings.
          </p>
        </div>

        <button
          onClick={fetchBookings}
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

      <div className="grid gap-5 md:grid-cols-3 xl:grid-cols-6">
        <PremiumCard>
          <CalendarDays className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Total</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.total}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Clock className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Pending</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.pending}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <CheckCircle2 className="mb-4 h-7 w-7 text-emerald-300" />
          <p className="text-xs text-slate-400">Confirmed</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.confirmed}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <XCircle className="mb-4 h-7 w-7 text-red-300" />
          <p className="text-xs text-slate-400">Rejected</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.rejected}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <XCircle className="mb-4 h-7 w-7 text-slate-300" />
          <p className="text-xs text-slate-400">Cancelled</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.cancelled}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <IndianRupee className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Revenue</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            ₹{Number(stats.revenue || 0).toLocaleString("en-IN")}
          </h2>
        </PremiumCard>
      </div>

      <PremiumCard className="mt-6">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, email, room, status, date..."
              className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
            No bookings found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                  <div className="flex gap-4">
                    <img
                      src={
                        booking.roomId?.imageUrl ||
                        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200"
                      }
                      alt={booking.roomId?.name || "Room"}
                      className="hidden h-24 w-28 rounded-2xl object-cover md:block"
                    />

                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                            booking.status
                          )}`}
                        >
                          {booking.status === "pending"
                            ? "pending approval"
                            : booking.status}
                        </span>

                        <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-200">
                          {formatRoomType(booking.roomId?.type)}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-white">
                        {booking.roomId?.name || "Room"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {booking.userId?.name || "User"} •{" "}
                        {booking.userId?.email || "-"}
                      </p>

                      <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <div className="rounded-2xl bg-black/30 p-3">
                          <CalendarDays className="mb-2 h-4 w-4 text-yellow-200" />
                          <p className="text-xs text-slate-500">Date</p>
                          <p className="text-sm font-bold text-white">
                            {booking.bookingDate}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/30 p-3">
                          <Clock className="mb-2 h-4 w-4 text-yellow-200" />
                          <p className="text-xs text-slate-500">Time</p>
                          <p className="text-sm font-bold text-white">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/30 p-3">
                          <Users className="mb-2 h-4 w-4 text-yellow-200" />
                          <p className="text-xs text-slate-500">Attendees</p>
                          <p className="text-sm font-bold text-white">
                            {booking.attendeesCount || 1}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/30 p-3">
                          <IndianRupee className="mb-2 h-4 w-4 text-yellow-200" />
                          <p className="text-xs text-slate-500">Amount</p>
                          <p className="text-sm font-bold text-yellow-200">
                            ₹{booking.amount}
                          </p>
                        </div>
                      </div>

                      {booking.purpose && (
                        <p className="mt-3 text-sm text-slate-400">
                          Purpose: {booking.purpose}
                        </p>
                      )}

                      {booking.rejectionReason && (
                        <p className="mt-3 text-sm text-red-300">
                          Rejection reason: {booking.rejectionReason}
                        </p>
                      )}

                      {booking.cancellationReason && (
                        <p className="mt-3 text-sm text-orange-300">
                          Cancellation reason: {booking.cancellationReason}
                        </p>
                      )}

                      <p className="mt-3 text-xs text-slate-500">
                        Requested: {formatDateTime(booking.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 xl:justify-end">
                    {booking.status === "pending" && (
                      <>
                        <button
                          disabled={actionLoadingId === booking._id}
                          onClick={() => handleApproveBooking(booking._id)}
                          className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          {actionLoadingId === booking._id
                            ? "Working..."
                            : "Approve"}
                        </button>

                        <button
                          disabled={actionLoadingId === booking._id}
                          onClick={() => handleRejectBooking(booking._id)}
                          className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {["pending", "confirmed"].includes(booking.status) && (
                      <button
                        disabled={actionLoadingId === booking._id}
                        onClick={() => handleCancelBooking(booking._id)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>
    </AnimatedPage>
  );
}