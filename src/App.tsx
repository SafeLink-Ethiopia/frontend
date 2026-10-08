import { useState } from "react";
import AdvisorLayout from "./components/advisor/AdvisorLayout";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import InformationPage from "./pages/InformationPage";
import { Assistant } from "./components/Assistant";
import UserProfile from "./pages/UserProfile";

// =========================
// Public Pages
// =========================

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
import UserConversations from "./pages/advisor/UserConversations";

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
// Landing Route
// =========================

function LandingRoute({ hasSavedSession }: { hasSavedSession: boolean }) {
  const navigate = useNavigate();

  return (
    <LandingPage
      onNeedHelp={() => navigate("/create")}
    
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
      onContinue={() => navigate("/user/dashboard")}
    />
  );
}

// =========================
// Support Route
// =========================

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
        {/* =====================================================
            PUBLIC ROUTES
        ====================================================== */}

        <Route
          path="/advisor/user-conversations"
          element={<UserConversations />}
        />
        <Route path="/user/profile" element={<UserProfile />} />
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

        {/* =====================================================
            USER DASHBOARD
        ====================================================== */}

        <Route path="/user/dashboard" element={<UserDashboard />} />

        {/* User → Advisor Chat */}
        <Route path="/user/dashboard/chat" element={<UserAdvisorChat />} />

        {/* Old route kept for compatibility */}
        <Route
          path="/user/advisor-chat"
          element={<Navigate to="/user/dashboard/chat" replace />}
        />

        <Route path="/helping" element={<HelpingRoute />} />

        <Route path="/quick-exit" element={<QuickExitPage />} />

        {/* =====================================================
            ADVISOR ROUTES
        ====================================================== */}

        {/* Advisor landing / main page */}
        <Route path="/advisor" element={<AdvisorPage />} />

        {/* Advisor login */}
        <Route path="/advisor/login" element={<AdvisorLoginPage />} />

        {/* Advisor dashboard */}
        {/* <Route path="/advisor/dashboard" element={<AdvisorDashboardPage />} /> */}

        {/* Advisor profile */}
        {/* <Route path="/advisor/profile" element={<AdvisorProfilePage />} /> */}

        {/* Advisor change password */}
        {/* <Route
          path="/advisor/change-password"
          element={<AdvisorProfilePage />}
        /> */}

        {/* Forgot password */}
        {/* <Route path="/advisor/forgot-password" element={<ForgotPassword />} /> */}

        {/* OTP verification */}
        <Route path="/advisor/verify-otp" element={<VerifyOtp />} />

        {/* Reset password */}
        {/* <Route path="/advisor/reset-password" element={<ResetPassword />} /> */}

        {/* Advisor messages */}
        {/* <Route path="/advisor/messages" element={<AdvisorMessages />} /> */}

        {/* Advisor → Admin Chat */}
        {/* <Route
          path="/advisor/messages/:conversationId"
          element={<AdvisorAdminChat />}
        /> */}

        {/* Advisor Dashboard / Application */}
        <Route element={<AdvisorLayout />}>
          {/* Dashboard */}
          <Route path="/advisor/dashboard" element={<AdvisorDashboardPage />} />

          {/* Profile */}
          <Route path="/advisor/profile" element={<AdvisorProfilePage />} />

          {/* Change password */}
          <Route
            path="/advisor/change-password"
            element={<AdvisorProfilePage />}
          />

          {/* Advisor messages */}
          <Route path="/advisor/messages" element={<AdvisorMessages />} />

          {/* Advisor → Admin chat */}
          <Route
            path="/advisor/messages/:conversationId"
            element={<AdvisorAdminChat />}
          />
        </Route>

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

      {/* Global Assistant
      <Assistant />
      */}
    </BrowserRouter>
  );
}

export default App;
