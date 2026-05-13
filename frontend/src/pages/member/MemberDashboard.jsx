import {
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  KeyRound,
  Loader2,
  RefreshCw,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import api from "../utils/api";

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

const formatRoomType = (type) => {
  return String(type || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const profileRes = await api.get("/auth/me");
      const loggedInUser = profileRes.data.user;
      const isAdmin = ["admin", "cabin_admin"].includes(loggedInUser?.role);

      setProfile(loggedInUser);

      if (isAdmin) {
        const [statsRes, bookingsRes, usersRes, roomsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/bookings"),
          api.get("/admin/users"),
          api.get("/admin/rooms"),
        ]);

        setStats(statsRes.data.stats || {});
        setBookings(bookingsRes.data.bookings || []);
        setUsers(usersRes.data.users || []);
        setRooms(roomsRes.data.rooms || []);
      } else {
        const [bookingsRes, roomsRes] = await Promise.all([
          api.get("/bookings/my"),
          api.get("/workspace/rooms"),
        ]);

        const userBookings = bookingsRes.data.bookings || [];

        setBookings(userBookings);
        setRooms(roomsRes.data.rooms || []);

        setStats({
          totalBookings: userBookings.length,
          confirmedBookings: userBookings.filter(
            (item) => item.status === "confirmed"
          ).length,
          cancelledBookings: userBookings.filter(
            (item) => item.status === "cancelled"
          ).length,
          totalAmount: userBookings
            .filter((item) => item.status === "confirmed")
            .reduce((sum, item) => sum + Number(item.amount || 0), 0),
        });
      }
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading dashboard...
        </div>
      </AnimatedPage>
    );
  }

  const isAdmin = ["admin", "cabin_admin"].includes(profile?.role);

  const adminCards = [
    {
      label: "Registered Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      sub: "Total user accounts",
    },
    {
      label: "Active Rooms",
      value: stats?.totalRooms || 0,
      icon: Building2,
      sub: "Bookable spaces",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: CalendarDays,
      sub: `${stats?.confirmedBookings || 0} confirmed`,
    },
    {
      label: "Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      sub: "Confirmed bookings",
    },
  ];

  const memberCards = [
    {
      label: "My Bookings",
      value: stats?.totalBookings || 0,
      icon: CalendarDays,
      sub: "All bookings created by you",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle2,
      sub: "Active upcoming bookings",
    },
    {
      label: "Cancelled",
      value: stats?.cancelledBookings || 0,
      icon: XCircle,
      sub: "Cancelled bookings",
    },
    {
      label: "Total Spend",
      value: `₹${Number(stats?.totalAmount || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      sub: "Confirmed booking amount",
    },
  ];

  const statCards = isAdmin ? adminCards : memberCards;

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">
            {isAdmin ? "Admin Analytics Dashboard" : "My Member Dashboard"}
          </h1>
          <p className="mt-2 text-slate-400">
            {isAdmin
              ? "Track registered users, rooms, bookings, and operational analytics."
              : "View your profile, bookings, booked rooms, and available BeUnicorn spaces."}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <PremiumCard key={card.label}>
              <Icon className="mb-4 h-8 w-8 text-yellow-200" />
              <p className="text-sm text-slate-400">{card.label}</p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {card.value}
              </h2>
              <p className="mt-2 text-xs text-slate-500">{card.sub}</p>
            </PremiumCard>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <PremiumCard className="xl:col-span-1">
          <div className="mb-5 flex items-center gap-3">
            <User className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">
              {isAdmin ? "Admin Profile" : "My Profile"}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Name</p>
              <p className="mt-1 font-bold text-white">{profile?.name}</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Email</p>
              <p className="mt-1 font-bold text-white">{profile?.email}</p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Phone</p>
              <p className="mt-1 font-bold text-white">
                {profile?.phone || "-"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Role</p>
              <p className="mt-1 font-bold text-yellow-200">
                {profile?.role}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Company</p>
              <p className="mt-1 font-bold text-white">
                {profile?.companyName || "Not added"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs text-slate-500">Joined</p>
              <p className="mt-1 font-bold text-white">
                {formatDateTime(profile?.createdAt)}
              </p>
            </div>
          </div>
        </PremiumCard>

        <PremiumCard className="xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-yellow-200" />
            <div>
              <h2 className="text-xl font-black text-white">
                {isAdmin ? "Recent Bookings" : "My Booking Details"}
              </h2>
              <p className="text-sm text-slate-400">
                {isAdmin
                  ? "Latest booking activity from all users."
                  : "All rooms booked by this logged-in member."}
              </p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No bookings found.
            </div>
          ) : (
            <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
              {bookings.slice(0, isAdmin ? 8 : bookings.length).map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-yellow-200">
                        {formatRoomType(booking.roomId?.type)}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-white">
                        {booking.roomId?.name || "Room"}
                      </h3>

                      {isAdmin && (
                        <p className="mt-1 text-sm text-slate-400">
                          User: {booking.userId?.name || "-"} •{" "}
                          {booking.userId?.email || "-"}
                        </p>
                      )}

                      <p className="mt-2 text-sm text-slate-400">
                        {booking.roomId?.buildingId?.name || "BeUnicorn"} •{" "}
                        {booking.roomId?.floorId?.name || "Floor"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        booking.status === "confirmed"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-red-400/10 text-red-300"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

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
                    <div className="mt-4 rounded-2xl bg-white/5 p-4">
                      <p className="text-xs text-slate-500">Purpose</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {booking.purpose}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>

      {isAdmin && (
        <PremiumCard className="mt-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="h-6 w-6 text-yellow-200" />
            <div>
              <h2 className="text-xl font-black text-white">
                Recent Registered Users
              </h2>
              <p className="text-sm text-slate-400">
                Latest users who registered on the platform.
              </p>
            </div>
          </div>

          {users.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No users found.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {users.slice(0, 8).map((user) => (
                <div
                  key={user.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-white">{user.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        {user.email}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.companyName || "No company"} • {user.role}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.status === "active"
                          ? "bg-emerald-400/10 text-emerald-300"
                          : user.status === "blocked"
                          ? "bg-red-400/10 text-red-300"
                          : "bg-yellow-300/10 text-yellow-200"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    Registered: {formatDateTime(user.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      )}

      {!isAdmin && (
        <PremiumCard className="mt-6">
          <div className="mb-5 flex items-center gap-3">
            <Building2 className="h-6 w-6 text-yellow-200" />
            <div>
              <h2 className="text-xl font-black text-white">
                Available BeUnicorn Spaces
              </h2>
              <p className="text-sm text-slate-400">
                Rooms available for booking by this member.
              </p>
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No rooms available.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rooms.slice(0, 6).map((room) => (
                <div
                  key={room._id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="h-36 w-full object-cover"
                  />

                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-yellow-200">
                      {formatRoomType(room.type)}
                    </p>

                    <h3 className="mt-1 font-black text-white">{room.name}</h3>

                    <p className="mt-2 text-sm text-slate-400">
                      Capacity: {room.capacity} • ₹{room.pricePerHour}/hr
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      )}
    </AnimatedPage>
  );
}