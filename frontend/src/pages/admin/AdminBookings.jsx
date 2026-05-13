import {
  Building2,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import api from "../utils/api";

const emptyRoomForm = {
  buildingId: "",
  floorId: "",
  name: "",
  roomCode: "",
  type: "meeting_room",
  capacity: 1,
  pricePerHour: 0,
  amenities: "",
  description: "",
  imageUrl: "",
  availabilityStatus: "available",
};

const formatRoomType = (type) => {
  return String(type || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

const statusClass = (status) => {
  if (status === "confirmed") return "bg-emerald-400/10 text-emerald-300";
  if (status === "pending") return "bg-yellow-300/10 text-yellow-200";
  if (status === "rejected") return "bg-red-500/10 text-red-300";
  if (status === "cancelled") return "bg-slate-500/10 text-slate-300";
  return "bg-white/10 text-white";
};

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  const [roomForm, setRoomForm] = useState(emptyRoomForm);

  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [
        statsRes,
        usersRes,
        roomsRes,
        bookingsRes,
        buildingsRes,
        floorsRes,
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/rooms"),
        api.get("/admin/bookings"),
        api.get("/workspace/buildings"),
        api.get("/workspace/floors"),
      ]);

      const buildingsData = buildingsRes.data.buildings || [];
      const floorsData = floorsRes.data.floors || [];

      setStats(statsRes.data.stats || {});
      setUsers(usersRes.data.users || []);
      setRooms(roomsRes.data.rooms || []);
      setBookings(bookingsRes.data.bookings || []);
      setBuildings(buildingsData);
      setFloors(floorsData);

      const firstBuilding = buildingsData[0]?._id || "";
      const firstFloor = floorsData[0]?._id || "";

      setRoomForm((prev) => ({
        ...prev,
        buildingId: prev.buildingId || firstBuilding,
        floorId: prev.floorId || firstFloor,
      }));
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();

    try {
      setCreatingRoom(true);
      setMessage("");
      setSuccess("");

      if (
        !roomForm.buildingId ||
        !roomForm.floorId ||
        !roomForm.name ||
        !roomForm.roomCode ||
        !roomForm.type ||
        !roomForm.capacity ||
        roomForm.pricePerHour === ""
      ) {
        setMessage("Please fill all required room fields.");
        return;
      }

      const payload = {
        ...roomForm,
        capacity: Number(roomForm.capacity),
        pricePerHour: Number(roomForm.pricePerHour),
      };

      const response = await api.post("/admin/rooms", payload);

      setSuccess(response.data.message || "Room created successfully.");

      setRoomForm({
        ...emptyRoomForm,
        buildingId: buildings[0]?._id || "",
        floorId: floors[0]?._id || "",
      });

      await fetchAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create room.");
    } finally {
      setCreatingRoom(false);
    }
  };

  const handleDisableRoom = async (roomId) => {
    const confirmed = window.confirm(
      "Are you sure you want to disable this room?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setSuccess("");

      const response = await api.delete(`/admin/rooms/${roomId}`);

      setSuccess(response.data.message || "Room disabled successfully.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to disable room.");
    }
  };

  const handleUpdateUserStatus = async (userId, status) => {
    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/admin/users/${userId}`, { status });

      setSuccess(response.data.message || "User updated successfully.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update user.");
    }
  };

  const handleAdminApproveBooking = async (bookingId) => {
    const confirmed = window.confirm("Approve this booking?");
    if (!confirmed) return;

    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/approve`);

      setSuccess(response.data.message || "Booking approved successfully.");
      await fetchAdminData();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to approve booking."
      );
    }
  };

  const handleAdminRejectBooking = async (bookingId) => {
    const reason = window.prompt("Enter rejection reason:", "Slot not available");
    if (reason === null) return;

    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/reject`, {
        reason,
      });

      setSuccess(response.data.message || "Booking rejected successfully.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to reject booking.");
    }
  };

  const handleAdminCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/cancel`, {
        reason: "Cancelled by admin from admin dashboard",
      });

      setSuccess(response.data.message || "Booking cancelled successfully.");
      await fetchAdminData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to cancel booking.");
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      sub: "Registered members",
    },
    {
      label: "Pending Requests",
      value: stats?.pendingBookings || 0,
      icon: CalendarDays,
      sub: "Waiting for approval",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedBookings || 0,
      icon: CheckCircle2,
      sub: "Approved bookings",
    },
    {
      label: "Revenue",
      value: `₹${Number(stats?.totalRevenue || 0).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      sub: "From confirmed bookings",
    },
  ];

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading admin dashboard...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">
            Admin Dashboard & Operations
          </h1>
          <p className="mt-2 text-slate-400">
            Approve booking requests, manage users, rooms and workspace
            operations.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
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
            <Plus className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">Add New Room</h2>
          </div>

          <form onSubmit={handleCreateRoom} className="space-y-3">
            <select
              value={roomForm.buildingId}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, buildingId: e.target.value }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
            >
              <option value="">Select Building</option>
              {buildings.map((building) => (
                <option key={building._id} value={building._id}>
                  {building.name}
                </option>
              ))}
            </select>

            <select
              value={roomForm.floorId}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, floorId: e.target.value }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
            >
              <option value="">Select Floor</option>
              {floors.map((floor) => (
                <option key={floor._id} value={floor._id}>
                  {floor.name}
                </option>
              ))}
            </select>

            <input
              value={roomForm.name}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Room name"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={roomForm.roomCode}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, roomCode: e.target.value }))
              }
              placeholder="Room code e.g. MR-002"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <select
              value={roomForm.type}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
            >
              <option value="meeting_room">Meeting Room</option>
              <option value="conference_room">Conference Room</option>
              <option value="creator_studio">Creator Studio</option>
              <option value="event_space">Event Space</option>
              <option value="cabin">Cabin</option>
              <option value="hot_desk">Hot Desk</option>
              <option value="day_pass">Day Pass</option>
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min="1"
                value={roomForm.capacity}
                onChange={(e) =>
                  setRoomForm((prev) => ({
                    ...prev,
                    capacity: e.target.value,
                  }))
                }
                placeholder="Capacity"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />

              <input
                type="number"
                min="0"
                value={roomForm.pricePerHour}
                onChange={(e) =>
                  setRoomForm((prev) => ({
                    ...prev,
                    pricePerHour: e.target.value,
                  }))
                }
                placeholder="Price/hr"
                className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <input
              value={roomForm.amenities}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, amenities: e.target.value }))
              }
              placeholder="Amenities comma separated"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={roomForm.imageUrl}
              onChange={(e) =>
                setRoomForm((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
              placeholder="Image URL"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <textarea
              value={roomForm.description}
              onChange={(e) =>
                setRoomForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Room description"
              className="h-24 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />

            <button
              type="submit"
              disabled={creatingRoom}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingRoom ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {creatingRoom ? "Creating..." : "Create Room"}
            </button>
          </form>
        </PremiumCard>

        <PremiumCard className="xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Rooms</h2>
              <p className="mt-1 text-sm text-slate-400">
                Admin-created rooms appear on the member booking page.
              </p>
            </div>
          </div>

          <div className="max-h-[670px] space-y-3 overflow-y-auto pr-1">
            {rooms.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No rooms found.
              </div>
            ) : (
              rooms.map((room) => (
                <div
                  key={room._id}
                  className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[110px_1fr_auto]"
                >
                  <img
                    src={
                      room.imageUrl ||
                      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200"
                    }
                    alt={room.name}
                    className="h-24 w-full rounded-2xl object-cover md:w-28"
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        {room.name}
                      </h3>

                      <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-200">
                        {formatRoomType(room.type)}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          room.isActive
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-red-400/10 text-red-300"
                        }`}
                      >
                        {room.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      {room.buildingId?.name || "-"} •{" "}
                      {room.floorId?.name || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Capacity: {room.capacity} • ₹{room.pricePerHour}/hr
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {room.description}
                    </p>
                  </div>

                  <div className="flex items-center md:justify-end">
                    {room.isActive && (
                      <button
                        onClick={() => handleDisableRoom(room._id)}
                        className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Disable
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <UserCog className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">Users</h2>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {users.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-white">{user.name}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateUserStatus(user.id, "active")}
                      className="rounded-xl bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300"
                    >
                      Active
                    </button>

                    <button
                      onClick={() => handleUpdateUserStatus(user.id, "pending")}
                      className="rounded-xl bg-yellow-300/10 px-3 py-2 text-xs font-bold text-yellow-200"
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => handleUpdateUserStatus(user.id, "blocked")}
                      className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300"
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </PremiumCard>

        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-yellow-200" />
            <h2 className="text-xl font-black text-white">All Bookings</h2>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {bookings.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
                No bookings found.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-white">
                        {booking.roomId?.name || "Room"}
                      </h3>

                      <p className="text-sm text-slate-400">
                        {booking.userId?.name || "User"} •{" "}
                        {booking.userId?.email || "-"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {booking.bookingDate} • {booking.startTime} -{" "}
                        {booking.endTime}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                        booking.status
                      )}`}
                    >
                      {booking.status === "pending"
                        ? "pending approval"
                        : booking.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-black text-yellow-200">
                      ₹{booking.amount}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-xs text-slate-500">
                        {formatDateTime(booking.createdAt)}
                      </p>

                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleAdminApproveBooking(booking._id)
                            }
                            className="rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => handleAdminRejectBooking(booking._id)}
                            className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {["pending", "confirmed"].includes(booking.status) && (
                        <button
                          onClick={() => handleAdminCancelBooking(booking._id)}
                          className="flex items-center gap-2 rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {booking.approvedBy && (
                    <p className="mt-3 text-xs text-emerald-300">
                      Approved by: {booking.approvedBy?.name}
                    </p>
                  )}

                  {booking.rejectionReason && (
                    <p className="mt-3 text-xs text-red-300">
                      Rejection reason: {booking.rejectionReason}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </PremiumCard>
      </div>
    </AnimatedPage>
  );
}