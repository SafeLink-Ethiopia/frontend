import HelpingPage from "./pages/HelpingPage";

import QuickExitPage from "./pages/QuickExitPage";
import { useState } from "react";
import LoginSessionPage from "./pages/LoginSessionPage";
import LandingPage from "./pages/LandingPage";
import CreateSessionPage from "./pages/CreateSessionPage";
import SessionCreatedPage from "./pages/SessionCreatedPage";
import PrivateSupportPage from "./pages/PrivateSupportPage";

type Page =
  | "landing"
  | "create"
  | "login"
  | "session-created"
  | "support"
  | "helping"
  | "quick-exit";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");

  const [safelinkId, setSafelinkId] = useState("");

  const [hasSavedSession, setHasSavedSession] = useState(() => {
    return localStorage.getItem("safelink_session") !== null;
  });

  /* ================= I NEED HELP ================= */

  const handleNeedHelp = () => {
    setCurrentPage("create");
  };

  /* ================= I'M HELPING ================= */

  const handleHelping = () => {
    setCurrentPage("helping");
  };

  /* ================= SESSION CREATED ================= */

  const handleSessionCreated = (id: string) => {
    setSafelinkId(id);
    setHasSavedSession(true);

    setCurrentPage("session-created");
  };

  /* ================= CONTINUE SESSION ================= */

  const handleContinueSession = () => {
    setCurrentPage("login");
  };

  /* ================= QUICK EXIT ================= */

  const handleQuickExit = () => {
    setSafelinkId("");
    setCurrentPage("quick-exit");
  };

  /* ================= SESSION CREATED PAGE ================= */

  if (currentPage === "session-created") {
    return (
      <SessionCreatedPage
        safelinkId={safelinkId}
        onContinue={() => setCurrentPage("support")}
      />
    );
  }

  /* ================= PRIVATE SUPPORT ================= */

  if (currentPage === "support") {
    return (
      <PrivateSupportPage
        safelinkId={safelinkId}
        onQuickExit={handleQuickExit}
      />
    );
  }
  if (currentPage === "login") {
    return (
      <LoginSessionPage
        onLoginSuccess={(id) => {
          setSafelinkId(id);
          setCurrentPage("support");
        }}
        onBack={() => setCurrentPage("landing")}
      />
    );
  }
  /* ================= CREATE SESSION ================= */

  if (currentPage === "create") {
    return (
      <CreateSessionPage
        onSessionCreated={handleSessionCreated}
        onBack={() => setCurrentPage("landing")}
      />
    );
  }

  /* ================= I'M HELPING ================= */
if (currentPage === "helping") {
  return <HelpingPage onBack={() => setCurrentPage("landing")} />;
}

  /* ================= QUICK EXIT ================= */

  if (currentPage === "quick-exit") {
    return <QuickExitPage />;
  }

  /* ================= LANDING ================= */

  return (
    <LandingPage
      onNeedHelp={handleNeedHelp}
      onHelping={handleHelping}
      hasSavedSession={hasSavedSession}
      onContinueSession={handleContinueSession}
    />
  );
}

export default App;
