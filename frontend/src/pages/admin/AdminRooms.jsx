import {
  Building2,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AnimatedPage from "../../components/AnimatedPage";
import PremiumCard from "../../components/PremiumCard";
import api from "../../utils/api";

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

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [editingRoomId, setEditingRoomId] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRoomsData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [roomsRes, buildingsRes, floorsRes] = await Promise.all([
        api.get("/admin/rooms"),
        api.get("/workspace/buildings"),
        api.get("/workspace/floors"),
      ]);

      const roomsData = roomsRes.data.rooms || [];
      const buildingsData = buildingsRes.data.buildings || [];
      const floorsData = floorsRes.data.floors || [];

      setRooms(roomsData);
      setBuildings(buildingsData);
      setFloors(floorsData);

      setRoomForm((prev) => ({
        ...prev,
        buildingId: prev.buildingId || buildingsData[0]?._id || "",
        floorId: prev.floorId || floorsData[0]?._id || "",
      }));
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsData();
  }, []);

  const stats = {
    total: rooms.length,
    active: rooms.filter((room) => room.isActive).length,
    inactive: rooms.filter((room) => !room.isActive).length,
    available: rooms.filter((room) => room.availabilityStatus === "available")
      .length,
  };

  const filteredRooms = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesType = typeFilter === "all" || room.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && room.isActive) ||
        (statusFilter === "inactive" && !room.isActive) ||
        room.availabilityStatus === statusFilter;

      const text = [
        room.name,
        room.roomCode,
        room.type,
        room.description,
        room.buildingId?.name,
        room.floorId?.name,
        room.availabilityStatus,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || text.includes(term);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [rooms, search, typeFilter, statusFilter]);

  const resetForm = () => {
    setEditingRoomId("");
    setRoomForm({
      ...emptyRoomForm,
      buildingId: buildings[0]?._id || "",
      floorId: floors[0]?._id || "",
    });
  };

  const handleSubmitRoom = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
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

      let response;

      if (editingRoomId) {
        response = await api.patch(`/admin/rooms/${editingRoomId}`, payload);
      } else {
        response = await api.post("/admin/rooms", payload);
      }

      setSuccess(
        response.data.message ||
          (editingRoomId
            ? "Room updated successfully."
            : "Room created successfully.")
      );

      resetForm();
      await fetchRoomsData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to save room.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoomId(room._id);
    setRoomForm({
      buildingId: room.buildingId?._id || room.buildingId || "",
      floorId: room.floorId?._id || room.floorId || "",
      name: room.name || "",
      roomCode: room.roomCode || "",
      type: room.type || "meeting_room",
      capacity: room.capacity || 1,
      pricePerHour: room.pricePerHour || 0,
      amenities: (room.amenities || []).join(", "),
      description: room.description || "",
      imageUrl: room.imageUrl || "",
      availabilityStatus: room.availabilityStatus || "available",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDisableRoom = async (roomId) => {
    const confirmed = window.confirm("Disable this room?");
    if (!confirmed) return;

    try {
      setActionLoadingId(roomId);
      setMessage("");
      setSuccess("");

      const response = await api.delete(`/admin/rooms/${roomId}`);

      setSuccess(response.data.message || "Room disabled successfully.");
      await fetchRoomsData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to disable room.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleActivateRoom = async (roomId) => {
    try {
      setActionLoadingId(roomId);
      setMessage("");
      setSuccess("");

      const response = await api.patch(`/admin/rooms/${roomId}`, {
        isActive: true,
        availabilityStatus: "available",
      });

      setSuccess(response.data.message || "Room activated successfully.");
      await fetchRoomsData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to activate room.");
    } finally {
      setActionLoadingId("");
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
          <Loader2 className="mr-3 h-6 w-6 animate-spin text-yellow-200" />
          Loading rooms...
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-3xl font-black text-white">Room Management</h1>
          <p className="mt-2 text-slate-400">
            Create, update, activate/deactivate, and manage BeUnicorn spaces.
          </p>
        </div>

        <button
          onClick={fetchRoomsData}
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

      <div className="grid gap-5 md:grid-cols-4">
        <PremiumCard>
          <Building2 className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Total Rooms</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.total}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Building2 className="mb-4 h-7 w-7 text-emerald-300" />
          <p className="text-xs text-slate-400">Active</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.active}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Building2 className="mb-4 h-7 w-7 text-red-300" />
          <p className="text-xs text-slate-400">Inactive</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.inactive}
          </h2>
        </PremiumCard>

        <PremiumCard>
          <Building2 className="mb-4 h-7 w-7 text-yellow-200" />
          <p className="text-xs text-slate-400">Available</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {stats.available}
          </h2>
        </PremiumCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <PremiumCard>
          <div className="mb-5 flex items-center gap-3">
            {editingRoomId ? (
              <Edit className="h-6 w-6 text-yellow-200" />
            ) : (
              <Plus className="h-6 w-6 text-yellow-200" />
            )}
            <h2 className="text-xl font-black text-white">
              {editingRoomId ? "Edit Room" : "Add New Room"}
            </h2>
          </div>

          <form onSubmit={handleSubmitRoom} className="space-y-3">
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
              disabled={Boolean(editingRoomId)}
              placeholder="Room code e.g. MR-002"
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none placeholder:text-slate-500 disabled:opacity-60"
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

            <select
              value={roomForm.availabilityStatus}
              onChange={(e) =>
                setRoomForm((prev) => ({
                  ...prev,
                  availabilityStatus: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none"
            >
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
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
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-300 px-5 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {saving
                ? "Saving..."
                : editingRoomId
                ? "Update Room"
                : "Create Room"}
            </button>

            {editingRoomId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-bold text-white hover:bg-white/10"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </PremiumCard>

        <PremiumCard className="xl:col-span-2">
          <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search room by name, code, type..."
                className="w-full rounded-2xl border border-white/10 bg-black/50 py-4 pl-12 pr-4 text-white outline-none placeholder:text-slate-500"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none"
            >
              <option value="all">All Types</option>
              <option value="meeting_room">Meeting Room</option>
              <option value="conference_room">Conference Room</option>
              <option value="creator_studio">Creator Studio</option>
              <option value="event_space">Event Space</option>
              <option value="cabin">Cabin</option>
              <option value="hot_desk">Hot Desk</option>
              <option value="day_pass">Day Pass</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-400">
              No rooms found.
            </div>
          ) : (
            <div className="max-h-[760px] space-y-4 overflow-y-auto pr-1">
              {filteredRooms.map((room) => (
                <div
                  key={room._id}
                  className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 md:grid-cols-[130px_1fr_auto]"
                >
                  <img
                    src={
                      room.imageUrl ||
                      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200"
                    }
                    alt={room.name}
                    className="h-28 w-full rounded-2xl object-cover md:w-32"
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
                            : "bg-red-500/10 text-red-300"
                        }`}
                      >
                        {room.isActive ? "Active" : "Inactive"}
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                        {room.availabilityStatus}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-400">
                      Code: {room.roomCode} • {room.buildingId?.name || "-"} •{" "}
                      {room.floorId?.name || "-"}
                    </p>

                    <p className="mt-2 text-sm text-slate-300">
                      Capacity: {room.capacity} • ₹{room.pricePerHour}/hr
                    </p>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {room.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(room.amenities || []).slice(0, 6).map((amenity) => (
                        <span
                          key={amenity}
                          className="rounded-full bg-black/30 px-3 py-1 text-xs text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                    >
                      Edit
                    </button>

                    {room.isActive ? (
                      <button
                        disabled={actionLoadingId === room._id}
                        onClick={() => handleDisableRoom(room._id)}
                        className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="inline h-4 w-4" /> Disable
                      </button>
                    ) : (
                      <button
                        disabled={actionLoadingId === room._id}
                        onClick={() => handleActivateRoom(room._id)}
                        className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </div>
    </AnimatedPage>
  );
}