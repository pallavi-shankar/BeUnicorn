import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";

import Landing from "./pages/public/Landing";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";

import MemberDashboard from "./pages/member/MemberDashboard";
import MemberBookings from "./pages/member/MemberBookings";
import MemberWallet from "./pages/member/MemberWallet";
import MemberNotifications from "./pages/member/MemberNotifications";
import MemberVerification from "./pages/member/MemberVerification";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminConsole from "./pages/admin/AdminConsole";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRooms from "./pages/admin/AdminRooms";
import AdminCompanies from "./pages/admin/AdminCompanies";

import Access from "./pages/Access";
import Integrations from "./pages/Integrations";
import IoT from "./pages/IoT";
import Onboarding from "./pages/Onboarding";
import Payments from "./pages/Payments";
import Printing from "./pages/Printing";
import Roadmap from "./pages/Roadmap";

import {
  getAdminToken,
  getAdminUser,
  getMemberToken,
  getMemberUser,
  isAdminRole,
} from "./utils/auth";

function AdminGate({ children }) {
  const token = getAdminToken();
  const user = getAdminUser();

  if (!token || !isAdminRole(user?.role)) {
    return <AdminLogin />;
  }

  return <Layout portal="admin">{children}</Layout>;
}

function AdminOnly({ children }) {
  const token = getAdminToken();
  const user = getAdminUser();

  if (!token || !isAdminRole(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Layout portal="admin">{children}</Layout>;
}

function MemberOnly({ children }) {
  const token = getMemberToken();
  const user = getMemberUser();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRole(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Layout portal="member">{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/member"
        element={
          <MemberOnly>
            <MemberDashboard />
          </MemberOnly>
        }
      />

      <Route
        path="/member/bookings"
        element={
          <MemberOnly>
            <MemberBookings />
          </MemberOnly>
        }
      />

      <Route
        path="/member/wallet"
        element={
          <MemberOnly>
            <MemberWallet />
          </MemberOnly>
        }
      />

      <Route
        path="/member/notifications"
        element={
          <MemberOnly>
            <MemberNotifications />
          </MemberOnly>
        }
      />

      <Route
        path="/member/verification"
        element={
          <MemberOnly>
            <MemberVerification />
          </MemberOnly>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminGate>
            <AdminConsole />
          </AdminGate>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <AdminOnly>
            <AdminDashboard />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminOnly>
            <AdminUsers />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/rooms"
        element={
          <AdminOnly>
            <AdminRooms />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <AdminOnly>
            <AdminCompanies />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/bookings"
        element={
          <AdminOnly>
            <AdminBookings />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/wallet"
        element={
          <AdminOnly>
            <AdminWallet />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/onboarding"
        element={
          <AdminOnly>
            <Onboarding />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/access"
        element={
          <AdminOnly>
            <Access />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/printing"
        element={
          <AdminOnly>
            <Printing />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <AdminOnly>
            <Payments />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/iot"
        element={
          <AdminOnly>
            <IoT />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/notifications"
        element={
          <AdminOnly>
            <MemberNotifications />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/integrations"
        element={
          <AdminOnly>
            <Integrations />
          </AdminOnly>
        }
      />

      <Route
        path="/admin/roadmap"
        element={
          <AdminOnly>
            <Roadmap />
          </AdminOnly>
        }
      />

      <Route path="/app" element={<Navigate to="/member" replace />} />
      <Route
        path="/app/bookings"
        element={<Navigate to="/member/bookings" replace />}
      />
      <Route path="/app/admin" element={<Navigate to="/admin" replace />} />
      <Route path="/app/wallet" element={<Navigate to="/member/wallet" replace />} />
      <Route
        path="/app/notifications"
        element={<Navigate to="/member/notifications" replace />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}