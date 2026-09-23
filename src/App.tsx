import { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

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

// Each *Route wrapper below exists for one reason: the already-built
// page components (from main) take callback PROPS like onNeedHelp,
// onBack, onContinue — they were written for state-based switching.
// Routing needs those same callbacks to navigate to a URL instead of
// calling setCurrentPage. These wrappers translate one into the other
// without having to rewrite the page components themselves.

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

        {/*
          TODO — not yet added by anyone: Assistant.tsx's
          showAwarenessPage() navigates to /awareness/consent and
          /awareness/harassment, but no route exists for either yet.
          Ask Person 4 to add an AwarenessPage component and a route
          here, e.g.: <Route path="/awareness/:slug" element={<AwarenessPage />} />
        */}
      </Routes>

     
    </BrowserRouter>
  );
}

export default App;
