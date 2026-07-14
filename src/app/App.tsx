import { Routes, Route, useNavigate } from "react-router";
import { AppProvider, useApp } from "./AppContext";
import { Shell } from "./components/Shell";
import { LandingPage } from "./components/landing/LandingPage";
import { ClientViews } from "./views/ClientViews";
import { DeveloperViews } from "./views/DeveloperViews";
import { TMViews } from "./views/TMViews";
import { AdminViews } from "./views/AdminViews";
import { Toaster } from "./components/ui/sonner";

function RoleRouter() {
  const { role } = useApp();
  switch (role) {
    case "client": return <ClientViews />;
    case "developer": return <DeveloperViews />;
    case "tm": return <TMViews />;
    case "admin": return <AdminViews />;
    default: return <ClientViews />;
  }
}

function Dashboard() {
  return (
    <AppProvider>
      <Shell>
        <RoleRouter />
      </Shell>
      <Toaster position="bottom-left" theme="dark" richColors />
    </AppProvider>
  );
}

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* Marketing landing page — the public entry point */}
      <Route path="/" element={<LandingPage onEnter={() => navigate("/app")} />} />
      {/* The existing role-based dashboard, now at its own URL */}
      <Route path="/app/*" element={<Dashboard />} />
    </Routes>
  );
}
