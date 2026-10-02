import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import { Assistant } from "./components/Assistant";
import UserDashboard from "./pages/UserDashboard";

// =========================
// Public Pages
// =========================
import LandingPage from "./pages/LandingPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import SessionCreatedPage from "./pages/SessionCreatedPage";
import PrivateSupportPage from "./pages/PrivateSupportPage";
import HelpingPage from "./pages/HelpingPage";
import QuickExitPage from "./pages/QuickExitPage";
import MedicalFlowPage from "./pages/MedicalFlowPage";
import LoginPage from "./pages/LoginPage"; // unified user + advisor login

// =========================
// Awareness Pages — built by Person 4
// (imports were missing on the feature/user-dashboard branch; restored here)
// =========================
import Awareness from "./pages/Awareness";
import Consent from "./pages/Consent";
import Boundaries from "./pages/Boundaries";
import Harassment from "./pages/Harassment";
import Support from "./pages/Support";

// =========================
// Advisor Pages
// =========================
import AdvisorPage from "./pages/AdvisorPage";
import AdvisorDashboardPage from "./pages/AdvisorDashboardPage";
import AdvisorProfilePage from "./pages/AdvisorProfilePage";
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
// Route wrapper components
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

function DashboardRoute({ safelinkId }: { safelinkId: string }) {
  const navigate = useNavigate();
  return (
    <UserDashboard
      safelinkId={safelinkId}
      onOpenConversation={(conversationId) =>
        navigate(`/conversation/${conversationId}`)
      }
    />
  );
}

// =========================
// Main App
// =========================

function App() {
  const [safelinkId, setSafelinkId] = useState(() => {
    const savedSession = localStorage.getItem("safelink_session");
    if (!savedSession) return "";
    try {
      const session = JSON.parse(savedSession);
      return session.safelink_id || "";
    } catch {
      return "";
    }
  });

  const [hasSavedSession] = useState(() => {
    return localStorage.getItem("safelink_session") !== null;
  });

  const handleSessionCreated = (id: string) => {
    setSafelinkId(id);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ====================================================== */}
        <Route path="/" element={<LandingRoute hasSavedSession={hasSavedSession} />} />
        <Route path="/create" element={<CreateSessionRoute onSessionCreated={handleSessionCreated} />} />
        <Route path="/session-created" element={<SessionCreatedRoute safelinkId={safelinkId} />} />

        {/* Unified login — handles both user ("I already have a SafeLink ID")
            and advisor login in one screen. Replaces the old separate
            LoginSessionPage / AdvisorLoginPage routes. */}
        <Route path="/login" element={<LoginPage />} />

        <Route path="/support" element={<SupportRoute safelinkId={safelinkId} />} />
        <Route path="/helping" element={<HelpingRoute />} />
        <Route path="/quick-exit" element={<QuickExitPage />} />
        <Route path="/medical" element={<MedicalFlowPage />} />

        {/* User Dashboard — WhatsApp-style thread list across all advisor types */}
        <Route path="/dashboard" element={<DashboardRoute safelinkId={safelinkId} />} />

        {/* Awareness section — built by Person 4 */}
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/awareness/consent" element={<Consent />} />
        <Route path="/awareness/boundaries" element={<Boundaries />} />
        <Route path="/awareness/harassment" element={<Harassment />} />
        <Route path="/awareness/support" element={<Support />} />

        {/* =====================================================
            ADVISOR ROUTES
            Note: /advisor/login, forgot-password, verify-otp, and
            reset-password are intentionally dropped — login is now
            handled by the unified /login route above, and the
            forgot-password flow was decided as unnecessary.
        ====================================================== */}
        <Route path="/advisor" element={<AdvisorPage />} />
        <Route path="/advisor/dashboard" element={<AdvisorDashboardPage />} />
        <Route path="/advisor/profile" element={<AdvisorProfilePage />} />
        <Route path="/advisor/change-password" element={<AdvisorProfilePage />} />
        <Route path="/advisor/messages" element={<AdvisorMessages />} />
        <Route path="/advisor/messages/:conversationId" element={<AdvisorAdminChat />} />

        {/* =====================================================
            ADMIN LOGIN
        ====================================================== */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* =====================================================
            PROTECTED ADMIN ROUTES
        ====================================================== */}
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
            <Route path="/admin/advisors/:advisorId/chat" element={<AdminAdvisorChat />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>
        </Route>

        {/* =====================================================
            FALLBACK
        ====================================================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Assistant — mounted once, outside <Routes>, so an
          in-progress voice interaction survives navigation. */}
      <Assistant />
    </BrowserRouter>
  );
}

export default App;
