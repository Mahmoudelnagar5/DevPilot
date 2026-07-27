import { Routes, Route, useNavigate, Navigate } from "react-router";
import { AppProvider, useApp } from "./AppContext";
import { AuthProvider, useAuth } from "./AuthContext";
import { LanguageProvider } from "./LanguageContext";
import { Shell } from "./components/Shell";
import { LandingPage } from "./components/landing/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { ClientViews } from "./views/ClientViews";
import { DeveloperViews } from "./views/DeveloperViews";
import { TMViews } from "./views/TMViews";
import { AdminViews } from "./views/AdminViews";
import { Toaster } from "./components/ui/sonner";
import { useEffect } from "react";
import type { Role } from "./data/mock";

// ─── Role-based view router ───────────────────────────────────────────────────

function RoleRouter() {
  const { role } = useApp();
  switch (role) {
    case "client":    return <ClientViews />;
    case "developer": return <DeveloperViews />;
    case "tm":        return <TMViews />;
    case "admin":     return <AdminViews />;
    default:          return <ClientViews />;
  }
}

// ─── Dashboard wrapper ───────────────────────────────────────────────────────

function Dashboard() {
  const { profile, user: authUser } = useAuth();
  const { role, setRole } = useApp();

  // Sync the app role with the authenticated user's profile role or user_metadata role
  useEffect(() => {
    const effectiveRole = (profile?.role || authUser?.user_metadata?.role) as Role | undefined;
    if (effectiveRole && effectiveRole !== role) {
      setRole(effectiveRole);
    }
  }, [profile?.role, authUser?.user_metadata?.role, role, setRole]);

  return (
    <>
      <Shell>
        <RoleRouter />
      </Shell>
      <Toaster position="bottom-left" theme="dark" richColors />
    </>
  );
}

// ─── Protected route guard ───────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    // Full-screen loading spinner while session is being resolved
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading DevPilot…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// ─── Auth route guard (redirect if already logged in) ────────────────────────

function AuthRoute() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/app" replace />;
  }

  return <AuthPage onAuthenticated={() => navigate("/app", { replace: true })} />;
}

function HomeRoute() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background">
        <div className="size-10 animate-spin rounded-full border-4 border-border border-t-primary" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/app" replace />;
  }

  return <LandingPage onEnter={() => navigate("/auth")} />;
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          {/* Home / Landing page — auto redirects to /app if logged in */}
          <Route path="/" element={<HomeRoute />} />

          {/* Auth page — redirects to /app if already signed in */}
          <Route path="/auth" element={<AuthRoute />} />

          {/* Protected dashboard */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppProvider>
                  <Dashboard />
                </AppProvider>
              </ProtectedRoute>
            }
          />

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
}
