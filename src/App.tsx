import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";

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

import Awareness from "./pages/Awareness";
import Consent from "./pages/Consent";
import Boundaries from "./pages/Boundaries";
import Harassment from "./pages/Harassment";
import Support from "./pages/Support";

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
          element={<CreateSessionRoute onSessionCreated={handleSessionCreated} />}
        />
        <Route
          path="/session-created"
          element={<SessionCreatedRoute safelinkId={safelinkId} />}
        />
        <Route
          path="/login"
          element={<LoginRoute onLoginSuccess={handleSessionCreated} />}
        />
        <Route path="/support" element={<SupportRoute safelinkId={safelinkId} />} />
        <Route path="/helping" element={<HelpingRoute />} />
        <Route path="/quick-exit" element={<QuickExitPage />} />
        <Route path="/medical" element={<MedicalFlowPage />} />
        <Route path="/advisor" element={<AdvisorPage />} />

        {/* Awareness section — built by Person 4 */}
        <Route path="/awareness" element={<Awareness />} />
        <Route path="/awareness/consent" element={<Consent />} />
        <Route path="/awareness/boundaries" element={<Boundaries />} />
        <Route path="/awareness/harassment" element={<Harassment />} />
        <Route path="/awareness/support" element={<Support />} />

        {/* Unknown URL → back to landing, instead of a blank/broken page */}
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
