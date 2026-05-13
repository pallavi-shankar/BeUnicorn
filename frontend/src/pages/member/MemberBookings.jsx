import {
  CalendarDays,
  Clock,
  DoorOpen,
  Loader2,
  Snowflake,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedPage from "../components/AnimatedPage";
import PremiumCard from "../components/PremiumCard";
import api from "../utils/api";

const formatRoomType = (type) => {
  return String(type || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDateOptions = () => {
  const dates = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    const value = date.toISOString().split("T")[0];

    const label = date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    dates.push({ label, value });
  }

  return dates;
};

const timeSlots = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const formatTimeLabel = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const todayDate = () => new Date().toISOString().split("T")[0];

const statusClass = (status) => {
  if (status === "confirmed") return "bg-emerald-400/10 text-emerald-300";
  if (status === "pending") return "bg-yellow-300/10 text-yellow-200";
  if (status === "rejected") return "bg-red-500/10 text-red-300";
  if (status === "cancelled") return "bg-slate-500/10 text-slate-300";
  return "bg-white/10 text-white";
};

export default function Bookings() {
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [bookingForm, setBookingForm] = useState({
    bookingDate: todayDate(),
    startTime: "10:00",
    endTime: "11:00",
    purpose: "",
    attendeesCount: 1,
  });

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setMessage("");

      const query = selectedType ? `?type=${selectedType}` : "";
      const response = await api.get(`/workspace/rooms${query}`);

      setRooms(response.data.rooms || []);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load workspace rooms."
      );
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);

      const response = await api.get("/bookings/my");
      setMyBookings(response.data.bookings || []);
    } catch (error) {
      setMessage(
        error?.response?.data?.message || "Failed to load your bookings."
      );
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedType]);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCreateBooking = async (e) => {
    e.preventDefault();

    if (!selectedRoom) {
      setMessage("Please select a room first.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      setSuccess("");

      const payload = {
        roomId: selectedRoom._id,
        bookingDate: bookingForm.bookingDate,
        startTime: bookingForm.startTime,
        endTime: bookingForm.endTime,
        purpose: bookingForm.purpose,
        attendeesCount: Number(bookingForm.attendeesCount || 1),
      };

      const response = await api.post("/bookings", payload);

      setSuccess(
        response.data.message ||
          "Booking request submitted successfully. Please wait for admin confirmation."
      );

      await fetchMyBookings();

      setBookingForm((prev) => ({
        ...prev,
        purpose: "",
        attendeesCount: 1,
      }));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/bookings/${bookingId}/cancel`, {
        reason: "Cancelled from member portal",
      });

      setSuccess(response.data.message || "Booking cancelled successfully.");
      await fetchMyBookings();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to cancel booking.");
    }
  };

  return (
    <AnimatedPage>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">
          Booking & Scheduling
        </h1>
        <p className="mt-2 text-slate-400">
          Select a workspace, submit booking request, and wait for admin
          confirmation.
        </p>
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

      <div className="mb-6 grid gap-6 xl:grid-cols-3">
        <PremiumCard className="xl:col-span-2">
          <h2 className="text-xl font-black text-white">Available Spaces</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            {[
              { label: "All", value: "" },
              { label: "Meeting Room", value: "meeting_room" },
              { label: "Conference", value: "conference_room" },
              { label: "Creator Studio", value: "creator_studio" },
              { label: "Event Space", value: "event_space" },
              { label: "Hot Desk", value: "hot_desk" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setSelectedType(item.value);
                  setSelectedRoom(null);
                }}
                className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                  selectedType === item.value
                    ? "bg-yellow-300 text-black"
                    : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loadingRooms ? (
            <div className="flex items-center justify-center py-16 text-slate-300">
              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              Loading rooms...
            </div>
          ) : rooms.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
              No rooms found.
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {rooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => setSelectedRoom(room)}
                  className={`cursor-pointer overflow-hidden rounded-3xl border bg-white/5 transition hover:-translate-y-1 ${
                    selectedRoom?._id === room._id
                      ? "border-yellow-300"
                      : "border-white/10"
                  }`}
                >
                  <img
                    src={room.imageUrl}
                    alt={room.name}
                    className="h-44 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-yellow-200">
                          {formatRoomType(room.type)}
                        </p>
                        <h3 className="mt-1 text-xl font-black text-white">
                          {room.name}
                        </h3>
                      </div>

                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                        {room.availabilityStatus}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      {room.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(room.amenities || []).slice(0, 4).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-slate-300">
                        <Users className="h-4 w-4 text-yellow-200" />
                        {room.capacity} people
                      </span>

                      <span className="text-lg font-black text-yellow-200">
                        ₹{room.pricePerHour}/hr
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-xl font-black text-white">Request Booking</h2>

          {selectedRoom ? (
            <form onSubmit={handleCreateBooking} className="mt-5">
              <img
                src={selectedRoom.imageUrl}
                alt={selectedRoom.name}
                className="h-36 w-full rounded-3xl object-cover"
              />

              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-yellow-200">
                {formatRoomType(selectedRoom.type)}
              </p>

              <h3 className="mt-1 text-2xl font-black text-white">
                {selectedRoom.name}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Booking will be submitted as pending. Admin approval is required
                for confirmation.
              </p>

              <div className="mt-4 space-y-3">
                <select
                  value={bookingForm.bookingDate}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      bookingDate: e.target.value,
                    }))
                  }
                  className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none"
                >
                  {getDateOptions().map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={bookingForm.startTime}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {formatTimeLabel(time)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={bookingForm.endTime}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {formatTimeLabel(time)}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={bookingForm.attendeesCount}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      attendeesCount: e.target.value,
                    }))
                  }
                  className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none"
                >
                  {Array.from(
                    { length: selectedRoom.capacity },
                    (_, index) => index + 1
                  ).map((count) => (
                    <option key={count} value={count}>
                      {count} attendee{count > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>

                <textarea
                  value={bookingForm.purpose}
                  onChange={(e) =>
                    setBookingForm((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                  placeholder="Purpose of booking"
                  className="h-24 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none placeholder:text-slate-500"
                />

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-400">Price</p>
                  <p className="mt-1 text-xl font-black text-yellow-200">
                    ₹{selectedRoom.pricePerHour}/hour
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {submitting ? "Submitting..." : "Submit Booking Request"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
              Select a room to create booking request.
            </div>
          )}
        </PremiumCard>
      </div>

      <PremiumCard>
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white">My Bookings</h2>
            <p className="mt-1 text-sm text-slate-400">
              Pending bookings are waiting for admin confirmation.
            </p>
          </div>

          <button
            onClick={fetchMyBookings}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
          >
            Refresh
          </button>
        </div>

        {loadingBookings ? (
          <div className="flex items-center justify-center py-12 text-slate-300">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Loading bookings...
          </div>
        ) : myBookings.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
            No bookings found.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {myBookings.map((booking) => (
              <div
                key={booking._id}
                className="rounded-3xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-yellow-200">
                      {formatRoomType(booking.roomId?.type)}
                    </p>
                    <h3 className="mt-1 text-xl font-black text-white">
                      {booking.roomId?.name}
                    </h3>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status === "pending"
                      ? "waiting for confirmation"
                      : booking.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-black/30 p-3">
                    <CalendarDays className="mb-2 h-4 w-4 text-yellow-200" />
                    <p className="text-sm text-slate-300">
                      {booking.bookingDate}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3">
                    <Clock className="mb-2 h-4 w-4 text-yellow-200" />
                    <p className="text-sm text-slate-300">
                      {formatTimeLabel(booking.startTime)} -{" "}
                      {formatTimeLabel(booking.endTime)}
                    </p>
                  </div>
                </div>

                {booking.rejectionReason && (
                  <div className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm text-red-300">
                    Rejection reason: {booking.rejectionReason}
                  </div>
                )}

                {booking.approvedBy && (
                  <div className="mt-4 rounded-2xl bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    Approved by: {booking.approvedBy?.name}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-black text-yellow-200">
                    ₹{booking.amount}
                  </p>

                  {["pending", "confirmed"].includes(booking.status) && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PremiumCard>

      <PremiumCard className="mt-6">
        <h2 className="text-xl font-black text-white">Booking Flow Status</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { icon: Wallet, title: "Wallet Later" },
            { icon: CalendarDays, title: "Pending Approval" },
            { icon: DoorOpen, title: "Access After Approval" },
            { icon: Snowflake, title: "IoT Later" },
          ].map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="rounded-3xl bg-white/5 p-4">
                <Icon className="mb-3 h-6 w-6 text-yellow-200" />
                <p className="font-bold text-white">{step.title}</p>
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </AnimatedPage>
  );
}