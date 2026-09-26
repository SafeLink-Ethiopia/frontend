import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Assistant } from "./components/Assistant";

import LandingPage from "./pages/LandingPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import SessionCreatedPage from "./pages/SessionCreatedPage";
import LoginSessionPage from "./pages/LoginSessionPage";
import PrivateSupportPage from "./pages/PrivateSupportPage";
import HelpingPage from "./pages/HelpingPage";
import QuickExitPage from "./pages/QuickExitPage";
import MedicalFlowPage from "./pages/MedicalFlowPage";
import AdvisorPage from "./pages/AdvisorPage";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAwareness from "./pages/admin/AdminAwareness";

function LandingRoute({ hasSavedSession }: { hasSavedSession: boolean }) {
  const navigate = useNavigate();

  return (
    <LandingPage
      onNeedHelp={() => navigate("/create")}
      onHelping={() => navigate("/helping")}
      hasSavedSession={hasSavedSession}
      onContinueSession={() => navigate("/login")}
    />
  );
}

function CreateSessionRoute({
  onSessionCreated,
}: {
  onSessionCreated: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <CreateSessionPage
      onSessionCreated={(id: string) => {
        onSessionCreated(id);
        navigate("/session-created");
      }}
      onBack={() => navigate("/")}
    />
  );
}

function SessionCreatedRoute({ safelinkId }: { safelinkId: string }) {
  const navigate = useNavigate();

  return (
    <SessionCreatedPage
      safelinkId={safelinkId}
      onContinue={() => navigate("/support")}
    />
  );
}

function LoginRoute({
  onLoginSuccess,
}: {
  onLoginSuccess: (id: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <LoginSessionPage
      onLoginSuccess={(id: string) => {
        onLoginSuccess(id);
        navigate("/support");
      }}
      onBack={() => navigate("/")}
    />
  );
}

function SupportRoute({ safelinkId }: { safelinkId: string }) {
  const navigate = useNavigate();

  return (
    <PrivateSupportPage
      safelinkId={safelinkId}
      onQuickExit={() => navigate("/quick-exit")}
      onMedicalHelp={() => navigate("/medical")}
    />
  );
}

function HelpingRoute() {
  const navigate = useNavigate();

  return <HelpingPage onBack={() => navigate("/")} />;
}

function App() {
  const [safelinkId, setSafelinkId] = useState("");

  const [hasSavedSession] = useState(() => {
    return localStorage.getItem("safelink_session") !== null;
  });

  const handleSessionCreated = (id: string) => {
    setSafelinkId(id);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingRoute hasSavedSession={hasSavedSession} />}
        />

        <Route
          path="/create"
          element={
            <CreateSessionRoute onSessionCreated={handleSessionCreated} />
          }
        />

        <Route
          path="/session-created"
          element={<SessionCreatedRoute safelinkId={safelinkId} />}
        />

        <Route
          path="/login"
          element={<LoginRoute onLoginSuccess={handleSessionCreated} />}
        />

        <Route
          path="/support"
          element={<SupportRoute safelinkId={safelinkId} />}
        />

        <Route path="/helping" element={<HelpingRoute />} />

        <Route path="/quick-exit" element={<QuickExitPage />} />

        <Route path="/medical" element={<MedicalFlowPage />} />

        <Route path="/advisor" element={<AdvisorPage />} />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/awareness" element={<AdminAwareness />} />

            <Route path="/admin/users" element={<div>Users</div>} />

            <Route path="/admin/reports" element={<div>Reports</div>} />

            <Route path="/admin/resources" element={<div>Resources</div>} />

            <Route path="/admin/settings" element={<div>Settings</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Mounted ONCE, here, outside <Routes> — this is what keeps it
          alive across every page navigation. Do not add another
          <Assistant /> anywhere else (e.g. inside MedicalFlowPage). */}
      <Assistant />
    </BrowserRouter>
  );
}

export default App;
