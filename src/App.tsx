import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { getSafelinkId } from "./services/session";
import AdvisorLayout from "./components/advisor/AdvisorLayout";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";



import UserLayout from "./components/user/UserLayout";
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
import { Assistant } from "./components/Assistant";




// =========================
// Advisor Pages
// =========================

import AdvisorPage from "./pages/AdvisorPage";
import AdvisorLoginPage from "./pages/AdvisorLoginPage";
import AdvisorDashboardPage from "./pages/AdvisorDashboardPage";
import AdvisorProfilePage from "./pages/AdvisorProfilePage";


import VerifyOtp from "./pages/advisor/VerifyOtp";

import AdvisorMessages from "./pages/advisor/AdvisorMessages";
import AdvisorAdminChat from "./pages/advisor/AdvisorAdminChat";
import UserConversations from "./pages/advisor/UserConversations";

// =========================
// Admin Pages
// =========================

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

// 
// =========================
// Main App
// =========================

function App() {
  const { t } = useTranslation();
  const [safelinkId, setSafelinkId] = useState("");

  const [hasSavedSession] = useState(() => {
    return Boolean(getSafelinkId());
  });

  const handleSessionCreated = (id: string) => {
    setSafelinkId(id);
  };

  return (
    <BrowserRouter>
      <LanguageSwitcher />
      <Assistant />
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

        <Route path="/login" element={<LoginPage />} />

        {/* =====================================================
            USER DASHBOARD
        ====================================================== */}

        <Route element={<UserLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/dashboard/chat" element={<UserAdvisorChat />} />
          <Route
            path="/user/advisor-chat"
            element={<Navigate to="/user/dashboard/chat" replace />}
          />
          <Route path="/awareness" element={<AwarenessPage />} />
          
        </Route>

        

  

        {/* =====================================================
            ADVISOR ROUTES
        ====================================================== */}

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
        <Route path="/advisor" element={<AdvisorLayout />}>
          <Route index element={<AdvisorPage />} />
          <Route
            path="user-conversations"
            element={<UserConversations />}
          />
          {/* Dashboard */}
          <Route path="dashboard" element={<AdvisorDashboardPage />} />

          {/* Profile */}
          <Route path="profile" element={<AdvisorProfilePage />} />

          {/* Change password */}
          <Route
            path="change-password"
            element={<AdvisorProfilePage />}
          />

          {/* Advisor messages */}
          <Route path="messages" element={<AdvisorMessages />} />

          {/* Advisor → Admin chat */}
          <Route
            path="messages/:conversationId"
            element={<AdvisorAdminChat />}
          />
          <Route path="awareness" element={<AwarenessPage />} />
          
        </Route>

        {/* {/* =====================================================
            ADMIN LOGIN
        ====================================================== */}

       

        {/* =====================================================
            PROTECTED ADMIN ROUTES
        ====================================================== */}

        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            {/* Admin Dashboard */}
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Awareness */}
            <Route path="awareness" element={<AdminAwareness />} />

            {/* Users */}
            <Route path="users" element={<div>{t("admin.placeholders.users")}</div>} />

            {/* Reports */}
            <Route path="reports" element={<div>{t("admin.placeholders.reports")}</div>} />

            {/* Resources */}
            <Route path="resources" element={<div>{t("admin.placeholders.resources")}</div>} />

            {/* Settings */}
            <Route path="settings" element={<div>{t("admin.placeholders.settings")}</div>} />

            {/* =================================================
                ADVISOR MANAGEMENT
            ================================================== */}

            <Route path="advisors/create" element={<CreateAdvisor />} />

            <Route path="advisors" element={<Advisors />} />

            {/* =================================================
                ADMIN → ADVISOR CHAT
            ================================================== */}

            <Route
              path="advisors/:advisorId/chat"
              element={<AdminAdvisorChat />}
            />

            {/* =================================================
                ADMIN MESSAGES
            ================================================== */}

            <Route path="messages" element={<AdminMessages />} />
          </Route>
        </Route>

        {/* =====================================================
            FALLBACK
        ====================================================== */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
