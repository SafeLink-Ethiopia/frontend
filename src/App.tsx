import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import InformationPage from "./pages/InformationPage";
import UserDashboard from "./pages/UserDashboard";
import UserAdvisorChat from "./pages/UserAdvisorChat";
import AwarenessPage from "./pages/AwarenessPage";
import LandingPage from "./pages/LandingPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import SessionCreatedPage from "./pages/SessionCreatedPage";
import LoginPage from "./pages/LoginPage";
import PrivateSupportPage from "./pages/PrivateSupportPage";
import HelpingPage from "./pages/HelpingPage";
import QuickExitPage from "./pages/QuickExitPage";
import MedicalFlowPage from "./pages/MedicalFlowPage";

import AdvisorPage from "./pages/AdvisorPage";
import AdvisorLoginPage from "./pages/AdvisorLoginPage";
import AdvisorDashboardPage from "./pages/AdvisorDashboardPage";
import AdvisorProfilePage from "./pages/AdvisorProfilePage";

import ForgotPassword from "./pages/advisor/ForgotPassword";
import VerifyOtp from "./pages/advisor/VerifyOtp";
import ResetPassword from "./pages/advisor/ResetPassword";
import AdvisorMessages from "./pages/advisor/AdvisorMessages";
import AdvisorAdminChat from "./pages/advisor/AdvisorAdminChat";
import UserConversations from "./pages/advisor/UserConversations";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAwareness from "./pages/admin/AdminAwareness";
import CreateAdvisor from "./pages/admin/CreateAdvisor";
import Advisors from "./pages/admin/Advisors";
import AdminAdvisorChat from "./pages/admin/AdminAdvisorChat";
import AdminMessages from "./pages/admin/AdminMessages";

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

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
          path="/advisor/user-conversations"
          element={<UserConversations />}
        />

        <Route
          path="/"
          element={<LandingRoute hasSavedSession={hasSavedSession} />}
        />

        <Route path="/information" element={<InformationPage />} />

        <Route
          path="/create"
          element={
            <CreateSessionRoute onSessionCreated={handleSessionCreated} />
          }
        />

        <Route path="/awareness" element={<AwarenessPage />} />

        <Route
          path="/session-created"
          element={<SessionCreatedRoute safelinkId={safelinkId} />}
        />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/user/dashboard" element={<UserDashboard />} />

        <Route path="/user/dashboard/chat" element={<UserAdvisorChat />} />

        <Route
          path="/user/advisor-chat"
          element={<Navigate to="/user/dashboard/chat" replace />}
        />

        <Route
          path="/support"
          element={<SupportRoute safelinkId={safelinkId} />}
        />

        <Route path="/helping" element={<HelpingRoute />} />

        <Route path="/quick-exit" element={<QuickExitPage />} />

        <Route path="/medical" element={<MedicalFlowPage />} />

        <Route path="/advisor" element={<AdvisorPage />} />

        <Route path="/advisor/login" element={<AdvisorLoginPage />} />

        <Route path="/advisor/dashboard" element={<AdvisorDashboardPage />} />

        <Route path="/advisor/profile" element={<AdvisorProfilePage />} />

        <Route
          path="/advisor/change-password"
          element={<AdvisorProfilePage />}
        />

        <Route path="/advisor/forgot-password" element={<ForgotPassword />} />

        <Route path="/advisor/verify-otp" element={<VerifyOtp />} />

        <Route path="/advisor/reset-password" element={<ResetPassword />} />

        <Route path="/advisor/messages" element={<AdvisorMessages />} />

        <Route
          path="/advisor/messages/:conversationId"
          element={<AdvisorAdminChat />}
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/awareness" element={<AdminAwareness />} />

            <Route path="/admin/users" element={<div>Users</div>} />

            <Route path="/admin/reports" element={<div>Reports</div>} />

            <Route path="/admin/resources" element={<div>Resources</div>} />

            <Route path="/admin/settings" element={<div>Settings</div>} />

            <Route path="/admin/advisors/create" element={<CreateAdvisor />} />

            <Route path="/admin/advisors" element={<Advisors />} />

            <Route
              path="/admin/advisors/:advisorId/chat"
              element={<AdminAdvisorChat />}
            />

            <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
