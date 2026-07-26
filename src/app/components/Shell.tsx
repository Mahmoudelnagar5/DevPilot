import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Receipt, MessageSquare, Users,
  Bell, Search, KanbanSquare, Clock, GitPullRequest, UserCircle, ListChecks,
  BarChart3, ShieldCheck, CreditCard, LifeBuoy, Layers, ChevronDown, Sparkles,
  Menu, X, ScrollText, Presentation, Globe,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useApp, DEFAULT_PAGE } from "../AppContext";
import { useLanguage } from "../LanguageContext";
import { CURRENT_USER, notifications, type Role } from "../data/mock";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "./ui/popover";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { AiAssistant } from "./AiAssistant";

interface NavItem { key: string; labelKey: string; icon: ReactNode; }

const NAV: Record<Role, NavItem[]> = {
  client: [
    { key: "dashboard", labelKey: "nav.dashboard", icon: <LayoutDashboard className="size-4" /> },
    { key: "project", labelKey: "nav.projectPlan", icon: <FolderKanban className="size-4" /> },
    { key: "milestones", labelKey: "nav.milestones", icon: <CheckSquare className="size-4" /> },
    { key: "invoices", labelKey: "nav.invoices", icon: <Receipt className="size-4" /> },
    { key: "messages", labelKey: "nav.messages", icon: <MessageSquare className="size-4" /> },
    { key: "team", labelKey: "nav.team", icon: <Users className="size-4" /> },
    { key: "trust", labelKey: "nav.trustLayer", icon: <ScrollText className="size-4" /> },
  ],
  developer: [
    { key: "board", labelKey: "nav.taskBoard", icon: <KanbanSquare className="size-4" /> },
    { key: "time", labelKey: "nav.timeTracking", icon: <Clock className="size-4" /> },
    { key: "reviews", labelKey: "nav.codeReviews", icon: <GitPullRequest className="size-4" /> },
    { key: "log", labelKey: "nav.dailyLog", icon: <ListChecks className="size-4" /> },
    { key: "standup", labelKey: "nav.standupCoach", icon: <Presentation className="size-4" /> },
    { key: "profile", labelKey: "nav.myProfile", icon: <UserCircle className="size-4" /> },
  ],
  tm: [
    { key: "overview", labelKey: "nav.overview", icon: <LayoutDashboard className="size-4" /> },
    { key: "review", labelKey: "nav.aiPlanReview", icon: <Sparkles className="size-4" /> },
    { key: "assign", labelKey: "nav.assignments", icon: <Users className="size-4" /> },
    { key: "prs", labelKey: "nav.prReviews", icon: <GitPullRequest className="size-4" /> },
    { key: "reports", labelKey: "nav.reports", icon: <BarChart3 className="size-4" /> },
    { key: "trust", labelKey: "nav.trustLayer", icon: <ScrollText className="size-4" /> },
  ],
  admin: [
    { key: "analytics", labelKey: "nav.analytics", icon: <BarChart3 className="size-4" /> },
    { key: "users", labelKey: "nav.users", icon: <Users className="size-4" /> },
    { key: "projects", labelKey: "nav.projects", icon: <FolderKanban className="size-4" /> },
    { key: "plans", labelKey: "nav.subscriptions", icon: <CreditCard className="size-4" /> },
    { key: "support", labelKey: "nav.support", icon: <LifeBuoy className="size-4" /> },
    { key: "settings", labelKey: "nav.platform", icon: <ShieldCheck className="size-4" /> },
  ],
};

export function Shell({ children }: { children: ReactNode }) {
  const { role, setRole, page, setPage } = useApp();
  const { lang, toggleLang, t } = useLanguage();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = CURRENT_USER[role];
  const nav = NAV[role];
  const unread = notifications.filter((n) => n.unread).length;
  const isRTL = lang === "ar";

  const navigate = (key: string) => {
    setPage(key);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground" dir={isRTL ? "rtl" : "ltr"}>
      {sidebarOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-border bg-sidebar transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0",
          isRTL
            ? "right-0 border-l"
            : "left-0 border-r",
          sidebarOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Layers className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold tracking-tight">{t("app.title")}</div>
            <div className="text-[10px] text-muted-foreground font-mono">AI Technical PM</div>
          </div>
          <button
            aria-label="Close navigation"
            className={cn("grid size-9 place-items-center rounded-md border border-border text-muted-foreground lg:hidden", isRTL ? "mr-auto" : "ml-auto")}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((item) => {
            const active = page === item.key || (item.key === DEFAULT_PAGE[role] && page === "project" && false);
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.icon}
                {t(item.labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="rounded-md bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Sparkles className="size-3.5" /> Llama 3.3 · Groq
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {isRTL
                ? "الذكاء الاصطناعي يقترح · والخبراء يعتمدون. جميع التقديرات استشارية."
                : "AI proposes · humans approve. All estimates are advisory."}
            </p>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 sm:gap-3 sm:px-5">
          <button
            aria-label="Open navigation"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-4" />
          </button>

          <div className={cn("relative hidden lg:flex items-center flex-1 max-w-md", isRTL && "flex-row-reverse")}>
            <Search className={cn("absolute size-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <input
              placeholder={t("topbar.search")}
              className={cn(
                "w-full rounded-md border border-border bg-muted/30 py-2 text-sm outline-none focus:border-primary/50",
                isRTL ? "pr-9 pl-3 text-right" : "pl-9 pr-3"
              )}
            />
          </div>
          <div className="flex-1 lg:hidden" />

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold hover:border-primary/50 transition-colors"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="size-3.5 text-primary" />
            <span>{isRTL ? "English" : "العربيّة"}</span>
          </button>

          {/* Role switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2 py-2 text-sm hover:border-primary/40 sm:px-3">
                <span className="hidden text-muted-foreground text-xs font-mono sm:inline">
                  {isRTL ? "عرض كـ" : "VIEW AS"}
                </span>
                <span className="max-w-[7rem] truncate font-medium sm:max-w-none">{t(`role.${role}`)}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("role.switch")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(["client", "developer", "tm", "admin"] as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                  {t(`role.${r}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <button className="relative grid size-9 place-items-center rounded-md border border-border hover:border-primary/40">
                <Bell className="size-4" />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b border-border px-4 py-3 font-medium">{t("topbar.notifications")}</div>
              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 px-4 py-3 text-sm hover:bg-accent/40">
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        n.type === "risk" ? "bg-destructive" : n.type === "review" ? "bg-chart-2" : n.type === "milestone" ? "bg-success" : "bg-muted-foreground"
                      )}
                    />
                    <div>
                      <p className={cn(n.unread ? "text-foreground" : "text-muted-foreground")}>{n.text}</p>
                      <span className="text-xs text-muted-foreground font-mono">{n.time} ago</span>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* User */}
          <div className="flex items-center gap-2 pl-0 sm:pl-2 border-l border-border ml-0 sm:ml-1 pl-0 sm:pl-3">
            <Avatar className="size-9">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-[11px] text-muted-foreground">{user.title}</div>
            </div>
          </div>
        </header>

        {/* Mobile bottom nav pills */}
        <div className="border-b border-border px-3 py-2 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {nav.map((item) => {
              const active = page === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                    active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground"
                  )}
                >
                  {item.icon}
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* Global AI assistant (Client + TM) */}
      {(role === "client" || role === "tm") && <AiAssistant />}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-start">
      <div className="min-w-0">
        <h1 className="font-display tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 sm:max-w-[60%]">{action}</div>}
    </div>
  );
}
