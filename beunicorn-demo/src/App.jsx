import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Access from "./pages/Access";
import Admin from "./pages/Admin";
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard";
import Integrations from "./pages/Integrations";
import IoT from "./pages/IoT";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Payments from "./pages/Payments";
import Printing from "./pages/Printing";
import Roadmap from "./pages/Roadmap";
import WalletPage from "./pages/WalletPage";

function Protected({ children }) {
  const isLoggedIn = localStorage.getItem("beunicorn_auth") === "true";

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/app"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />

      <Route
        path="/app/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />

      <Route
        path="/app/wallet"
        element={
          <Protected>
            <WalletPage />
          </Protected>
        }
      />

      <Route
        path="/app/bookings"
        element={
          <Protected>
            <Bookings />
          </Protected>
        }
      />

      <Route
        path="/app/access"
        element={
          <Protected>
            <Access />
          </Protected>
        }
      />

      <Route
        path="/app/printing"
        element={
          <Protected>
            <Printing />
          </Protected>
        }
      />

      <Route
        path="/app/payments"
        element={
          <Protected>
            <Payments />
          </Protected>
        }
      />

      <Route
        path="/app/iot"
        element={
          <Protected>
            <IoT />
          </Protected>
        }
      />

      <Route
        path="/app/notifications"
        element={
          <Protected>
            <Notifications />
          </Protected>
        }
      />

      <Route
        path="/app/admin"
        element={
          <Protected>
            <Admin />
          </Protected>
        }
      />

      <Route
        path="/app/integrations"
        element={
          <Protected>
            <Integrations />
          </Protected>
        }
      />

      <Route
        path="/app/roadmap"
        element={
          <Protected>
            <Roadmap />
          </Protected>
        }
      />
    </Routes>
  );
}