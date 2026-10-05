import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Assistant } from "./components/Assistant";

// =========================
// Public Pages
// =========================

import LandingPage from "./pages/LandingPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import SessionCreatedPage from "./pages/SessionCreatedPage";
import LoginSessionPage from "./pages/LoginSessionPage";
import PrivateSupportPage from "./pages/PrivateSupportPage";
import HelpingPage from "./pages/HelpingPage";
import QuickExitPage from "./pages/QuickExitPage";
import MedicalFlowPage from "./pages/MedicalFlowPage";

// =========================
// User ↔ Advisor Chat
// =========================

import UserAdvisorChat from "./components/UserAdvisorChat";

// =========================
// Advisor Pages
// =========================

import AdvisorPage from "./pages/AdvisorPage";
import AdvisorLoginPage from "./pages/AdvisorLoginPage";
import AdvisorDashboardPage from "./pages/AdvisorDashboardPage";
import AdvisorProfilePage from "./pages/AdvisorProfilePage";

import ForgotPassword from "./pages/advisor/ForgotPassword";
import VerifyOtp from "./pages/advisor/VerifyOtp";
import ResetPassword from "./pages/advisor/ResetPassword";
import AdvisorMessages from "./pages/advisor/AdvisorMessages";
import AdvisorAdminChat from "./pages/advisor/AdvisorAdminChat";

// =========================
// Admin Pages
// =========================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAwareness from "./pages/admin/AdminAwareness";
import CreateAdvisor from "./pages/admin/CreateAdvisor";
import Advisors from "./pages/admin/Advisors";
import AdminAdvisorChat from "./pages/admin/AdminAdvisorChat";
import AdminMessages from "./pages/admin/AdminMessages";

// =========================
// Admin Components
// =========================

import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// =========================
// SafeLink Session Helper
// =========================

function getSavedSafelinkId(): string {
  const savedSession = localStorage.getItem("safelink_session");

  if (!savedSession) {
    console.log("[App] No saved SafeLink session found.");
    return "";
  }

  console.log("[App] Raw saved SafeLink session:", savedSession);

  // --------------------------------------------------
  // Case 1:
  // localStorage contains the ID directly
  // Example:
  // "SL123456"
  // --------------------------------------------------

  try {
    const parsed = JSON.parse(savedSession);

    // JSON string:
    // "SL123456"
    if (typeof parsed === "string" && parsed.trim()) {
      console.log("[App] Restored SafeLink ID:", parsed);
      return parsed.trim();
    }

    // JSON object:
    // { safelink_id: "SL123456" }
    if (parsed && typeof parsed === "object") {
      const id =
        parsed.safelink_id ||
        parsed.safelinkId ||
        parsed.id ||
        parsed.session_id ||
        parsed.sessionId;

      if (typeof id === "string" && id.trim()) {
        console.log("[App] Restored SafeLink ID:", id);
        return id.trim();
      }
    }
  } catch {
    // --------------------------------------------------
    // Not JSON.
    // Treat the stored value as the SafeLink ID itself.
    // --------------------------------------------------

    if (savedSession.trim()) {
      console.log(
        "[App] Restored SafeLink ID from plain localStorage value:",
        savedSession.trim(),
      );

      return savedSession.trim();
    }
  }

  console.warn(
    "[App] safelink_session exists, but no SafeLink ID could be extracted.",
  );

  return "";
}

// =========================
// Landing Route
// =========================

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

// =========================
// Create Session Route
// =========================

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

// =========================
// Session Created Route
// =========================

function SessionCreatedRoute({ safelinkId }: { safelinkId: string }) {
  const navigate = useNavigate();

  return (
    <SessionCreatedPage
      safelinkId={safelinkId}
      onContinue={() => navigate("/support")}
    />
  );
}

// =========================
// Login Session Route
// =========================

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

// =========================
// Support Route
// =========================

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

// =========================
// User Advisor Chat Route
// =========================

function UserAdvisorChatRoute({ safelinkId }: { safelinkId: string }) {
  console.log(
    "[App] UserAdvisorChatRoute SafeLink ID:",
    safelinkId || "(EMPTY)",
  );

  return (
    <div className="h-screen bg-gray-50">
      <UserAdvisorChat sessionId={safelinkId} />
    </div>
  );
}

// =========================
// Helping Route
// =========================

function HelpingRoute() {
  const navigate = useNavigate();

  return <HelpingPage onBack={() => navigate("/")} />;
}

// =========================
// Main App
// =========================

function App() {
  // --------------------------------------------------
  // IMPORTANT:
  // Restore the existing SafeLink ID from localStorage
  // when the application starts.
  // --------------------------------------------------

  const [safelinkId, setSafelinkId] = useState<string>(getSavedSafelinkId);

  // --------------------------------------------------
  // Check whether a saved session exists
  // --------------------------------------------------

  const [hasSavedSession, setHasSavedSession] = useState<boolean>(() => {
    return localStorage.getItem("safelink_session") !== null;
  });

  // --------------------------------------------------
  // Called after creating a new session OR logging in
  // --------------------------------------------------

  const handleSessionCreated = (id: string) => {
    console.log("[App] SafeLink session received:", id);

    // Update React state immediately
    setSafelinkId(id);

    // Make sure the ID is persisted.
    //
    // IMPORTANT:
    // This stores the actual SafeLink ID as a JSON string.
    // The restore function above supports this format.
    localStorage.setItem("safelink_session", JSON.stringify(id));

    setHasSavedSession(true);

    console.log("[App] SafeLink session saved successfully.");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ====================================================== */}

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

        {/* =====================================================
            USER ↔ ADVISOR CHAT
        ====================================================== */}

        <Route
          path="/advisor-chat"
          element={<UserAdvisorChatRoute safelinkId={safelinkId} />}
        />

        <Route path="/helping" element={<HelpingRoute />} />

        <Route path="/quick-exit" element={<QuickExitPage />} />

        <Route path="/medical" element={<MedicalFlowPage />} />

        {/* =====================================================
            ADVISOR ROUTES
        ====================================================== */}

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

        {/* =====================================================
            ADMIN LOGIN
        ====================================================== */}

        <Route path="/admin/login" element={<AdminLogin />} />

        {/* =====================================================
            PROTECTED ADMIN ROUTES
        ====================================================== */}

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Admin Dashboard */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            {/* Awareness */}
            <Route path="/admin/awareness" element={<AdminAwareness />} />

            {/* Users */}
            <Route path="/admin/users" element={<div>Users</div>} />

            {/* Reports */}
            <Route path="/admin/reports" element={<div>Reports</div>} />

            {/* Resources */}
            <Route path="/admin/resources" element={<div>Resources</div>} />

            {/* Settings */}
            <Route path="/admin/settings" element={<div>Settings</div>} />

            {/* =================================================
                ADVISOR MANAGEMENT
            ================================================== */}

            <Route path="/admin/advisors/create" element={<CreateAdvisor />} />

            <Route path="/admin/advisors" element={<Advisors />} />

            {/* =================================================
                ADMIN → ADVISOR CHAT
            ================================================== */}

            <Route
              path="/admin/advisors/:advisorId/chat"
              element={<AdminAdvisorChat />}
            />

            {/* =================================================
                ADMIN MESSAGES
            ================================================== */}

            <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>
        </Route>

        {/* =====================================================
            FALLBACK
        ====================================================== */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Assistant */}
      <Assistant />
    </BrowserRouter>
  );
}

export default App;
