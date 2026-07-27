import { useState, type FormEvent } from "react";
import { Layers, Sparkles, Eye, EyeOff, User, Mail, Lock, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../LanguageContext";
import type { Role } from "../data/mock";

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthPageProps {
  onAuthenticated: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Localized roles
  const ROLES: { value: Role; label: string; description: string; color: string; icon: string }[] = [
    {
      value: "client",
      label: t("auth.clientRole"),
      description: t("auth.clientDesc"),
      color: "from-blue-500 to-cyan-500",
      icon: "💼",
    },
    {
      value: "developer",
      label: t("auth.developerRole"),
      description: t("auth.developerDesc"),
      color: "from-violet-500 to-purple-500",
      icon: "💻",
    },
    {
      value: "tm",
      label: t("auth.tmRole"),
      description: t("auth.tmDesc"),
      color: "from-amber-500 to-orange-500",
      icon: "🎯",
    },
    {
      value: "admin",
      label: t("auth.adminRole"),
      description: t("auth.adminDesc"),
      color: "from-rose-500 to-pink-500",
      icon: "⚙️",
    },
  ];

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFullName("");
    setSelectedRole("client");
    setError(null);
    setSuccessMsg(null);
  };

  const switchMode = (m: "signin" | "signup") => {
    setMode(m);
    resetForm();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError(t("auth.fillAllFields"));
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setError(t("auth.enterFullName"));
        return;
      }
      if (password !== confirmPassword) {
        setError(t("auth.passwordMismatch"));
        return;
      }
      if (password.length < 8) {
        setError(t("auth.passwordShort"));
        return;
      }
    }

    setLoading(true);

    if (mode === "signin") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        onAuthenticated();
      }
    } else {
      const { error, needsEmailConfirmation } = await signUp(email, password, fullName, selectedRole);
      if (error) {
        setError(error);
      } else if (!needsEmailConfirmation) {
        onAuthenticated();
      } else {
        setSuccessMsg(t("auth.success"));
        setTimeout(() => switchMode("signin"), 3000);
      }
    }

    setLoading(false);
  };

  const selectedRoleConfig = ROLES.find((r) => r.value === selectedRole)!;

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight text-white">DevPilot</div>
              <div className="text-[11px] text-slate-400 font-mono">AI-Powered Project Delivery</div>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary">
              <Sparkles className="size-3" />
              Powered by Groq · Llama 3.3
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              The AI co-pilot for{" "}
              <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
                software delivery
              </span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              From intake to deployment — DevPilot orchestrates your entire engineering pipeline with
              AI-generated plans, human oversight, and a tamper-proof decision ledger.
            </p>

            {/* Feature highlights */}
            <div className="space-y-3 pt-2">
              {[
                "AI requirements & architecture in seconds",
                "Automated sprint planning & risk scoring",
                "Immutable trust ledger for every decision",
                "Real-time code review & security analysis",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <div className="size-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 border-t border-white/10 pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">128+</div>
              <div className="text-xs text-slate-500">Active Projects</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1.5k+</div>
              <div className="text-xs text-slate-500">Users</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">$2.4M</div>
              <div className="text-xs text-slate-500">Managed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="size-4" />
          </div>
          <span className="font-bold text-lg">DevPilot</span>
        </div>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex rounded-xl border border-border bg-muted/30 p-1 mb-8">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {mode === "signin" ? "Welcome back" : "Get started today"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to your DevPilot account"
                : "Create your DevPilot account in seconds"}
            </p>
          </div>

          {/* Alert: success */}
          {successMsg && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              ✓ {successMsg}
            </div>
          )}

          {/* Alert: error */}
          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name (signup only) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="full-name">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="full-name"
                    type="text"
                    placeholder="Nadia Farouk"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "signup" ? "Min. 8 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-muted/30 pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password (signup only) */}
            {mode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="confirm-password">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-muted/30 pl-10 pr-10 py-2.5 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Role selector (signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Your role</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all duration-200 ${
                        selectedRole === r.value
                          ? "border-primary/60 bg-primary/5 shadow-sm shadow-primary/20"
                          : "border-border bg-muted/20 hover:border-border/80 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{r.icon}</span>
                        <span className="text-xs font-semibold">{r.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground leading-tight">
                        {r.description}
                      </span>
                      {selectedRole === r.value && (
                        <div className="absolute top-2 right-2 size-2 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground px-1">
                  {selectedRoleConfig.icon} You're signing up as{" "}
                  <strong>{selectedRoleConfig.label}</strong> — {selectedRoleConfig.description}.
                </p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === "signin" ? "Signing in…" : "Creating account…"}
                </>
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ChevronRight className="size-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch mode link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
              className="font-medium text-primary hover:underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            By continuing, you agree to DevPilot's Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
