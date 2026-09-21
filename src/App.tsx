import { useState } from "react";
import { createSession } from "./api/sessionApi";

type Language = "am" | "om" | "en";

function App() {
  const [showSession, setShowSession] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [password, setPassword] = useState("");
 const [safelinkId, setSafelinkId] = useState("");

 const [hasSavedSession, setHasSavedSession] = useState(() => {
   return localStorage.getItem("safelink_session") !== null;
 });
 const [showSupport, setShowSupport] = useState(false);

  const handleCreateSession = async () => {
    try {
      const response = await createSession(language, password || undefined);
const session = response.session;

localStorage.setItem("safelink_session", JSON.stringify(session));

setSafelinkId(session.safelink_id);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };
 if (showSupport) {
   return (
     <main className="min-h-screen flex items-center justify-center p-6">
       <div className="w-full max-w-md">
         <div className="mb-8">
           <p className="text-sm text-gray-500">Private Support Session</p>

           <h1 className="text-3xl font-bold mt-2">
             How can we help you today?
           </h1>
         </div>

         <button className="w-full border rounded-xl p-5 text-left hover:bg-gray-50">
           <div className="text-lg font-semibold">I need medical help</div>

           <div className="text-sm text-gray-500 mt-1">
             Connect me with medical support
           </div>
         </button>

         <button
           onClick={() => {
             window.location.href = "https://www.google.com";
           }}
           className="w-full mt-6 border rounded-xl p-4 text-red-600"
         >
           Quick Exit
         </button>
       </div>
     </main>
   );
 }
  if (safelinkId) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Your SafeLink ID</h1>

          <div className="border rounded-xl p-6 mb-4">
            <p className="text-2xl font-mono font-bold">{safelinkId}</p>
          </div>

          <p className="text-gray-600 mb-6">
            Keep this ID safe. You can use it to access your private session
            again.
          </p>

          <button
            onClick={() => setShowSupport(true)}
            className="w-full rounded-lg bg-black text-white py-3"
          >
            Continue
          </button>
        </div>
      </main>
    );
  }

  if (showSession) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-2">Create a Private Session</h1>

          <p className="text-gray-600 mb-8">
            No name, phone number, or email is required.
          </p>

          <label className="block mb-2 font-medium">Language</label>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full border rounded-lg p-3 mb-6"
          >
            <option value="en">English</option>
            <option value="am">Amharic</option>
            <option value="om">Afaan Oromoo</option>
          </select>

          <label className="block mb-2 font-medium">Optional PIN</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Leave empty if you don't want a PIN"
            className="w-full border rounded-lg p-3 mb-6"
          />

          <button
            onClick={handleCreateSession}
            className="w-full rounded-lg bg-black text-white py-3"
          >
            Create Private Session
          </button>

          <button
            onClick={() => setShowSession(false)}
            className="w-full mt-3 py-3"
          >
            Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">SafeLink Ethiopia</h1>

        <p className="text-gray-600 mb-8">Private support. Your next step.</p>

        <button
          onClick={() => setShowSession(true)}
          className="rounded-lg bg-black text-white px-8 py-3"
        >
          I Need Help
        </button>
      </div>
    </main>
  );
}

export default App;
