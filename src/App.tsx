import { BrowserRouter, Routes, Route } from "react-router-dom";
// import type { ReactElement } from "react";
import { Assistant } from "./components/Assistant";
import React from "react";
// Import your team's actual page components here as they're built, e.g.:
// import { LandingPage } from "./pages/LandingPage";
// import { MedicalFlowPage } from "./pages/MedicalFlowPage";
// import { AwarenessPage } from "./pages/AwarenessPage";

function App(): React.JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        {/* Add your team's routes here, e.g.: */}
        {/* <Route path="/" element={<LandingPage />} /> */}
        {/* <Route path="/medical" element={<MedicalFlowPage />} /> */}
        {/* <Route path="/awareness/:slug" element={<AwarenessPage />} /> */}
      </Routes>

      {/*
        The Assistant is mounted here, once, OUTSIDE <Routes> —
        this is what keeps it alive across every page/navigation.
        Never move this inside an individual page component.
      */}
      <Assistant />
    </BrowserRouter>
  );
}

export default App;
