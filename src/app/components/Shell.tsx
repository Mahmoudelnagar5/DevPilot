import { useState, type ReactNode } from "react";
import {
  LayoutDashboard, FolderKanban, CheckSquare, Receipt, MessageSquare, Users,
  Bell, Search, KanbanSquare, Clock, GitPullRequest, UserCircle, ListChecks,
  BarChart3, ShieldCheck, CreditCard, LifeBuoy, Layers, ChevronDown, Sparkles,
  Menu, X,
} from "lucide-react";
import { cn } from "./ui/utils";
import { useApp, DEFAULT_PAGE } from "../AppContext";
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

interface NavItem { key: string; label: string; icon: ReactNode; }

const NAV: Record<Role, NavItem[]> = {
  client: [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
    { key: "project", label: "Project Plan", icon: <FolderKanban className="size-4" /> },
    { key: "milestones", label: "Milestones", icon: <CheckSquare className="size-4" /> },
    { key: "invoices", label: "Invoices", icon: <Receipt className="size-4" /> },
    { key: "messages", label: "Messages", icon: <MessageSquare className="size-4" /> },
    { key: "team", label: "Team", icon: <Users className="size-4" /> },
  ],
  developer: [
    { key: "board", label: "Task Board", icon: <KanbanSquare className="size-4" /> },
    { key: "time", label: "Time Tracking", icon: <Clock className="size-4" /> },
    { key: "reviews", label: "Code Reviews", icon: <GitPullRequest className="size-4" /> },
    { key: "log", label: "Daily Log", icon: <ListChecks className="size-4" /> },
    { key: "profile", label: "My Profile", icon: <UserCircle className="size-4" /> },
  ],
  tm: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { key: "review", label: "AI Plan Review", icon: <Sparkles className="size-4" /> },
    { key: "assign", label: "Assignments", icon: <Users className="size-4" /> },
    { key: "prs", label: "PR Reviews", icon: <GitPullRequest className="size-4" /> },
    { key: "reports", label: "Reports", icon: <BarChart3 className="size-4" /> },
  ],
  admin: [
    { key: "analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
    { key: "users", label: "Users", icon: <Users className="size-4" /> },
    { key: "projects", label: "Projects", icon: <FolderKanban className="size-4" /> },
    { key: "plans", label: "Subscriptions", icon: <CreditCard className="size-4" /> },
    { key: "support", label: "Support", icon: <LifeBuoy className="size-4" /> },
    { key: "settings", label: "Platform", icon: <ShieldCheck className="size-4" /> },
  ],
};

const ROLE_LABEL: Record<Role, string> = {
  client: "Client",
  developer: "Developer",
  tm: "Technical Manager",
  admin: "Admin",
};

export function Shell({ children }: { children: ReactNode }) {
  const { role, setRole, page, setPage } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = CURRENT_USER[role];
  const nav = NAV[role];
  const unread = notifications.filter((n) => n.unread).length;

  const navigate = (key: string) => {
    setPage(key);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
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
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:static lg:z-auto lg:w-60 lg:max-w-none lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Layers className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display font-bold tracking-tight">DevPilot</div>
            <div className="text-[10px] text-muted-foreground font-mono">AI Technical PM</div>
          </div>
          <button
            aria-label="Close navigation"
            className="ml-auto grid size-9 place-items-center rounded-md border border-border text-muted-foreground lg:hidden"
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
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="rounded-md bg-muted/50 p-3">
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Sparkles className="size-3.5" /> Gemini engine
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              AI proposes · humans approve. All estimates are advisory.
            </p>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3 sm:gap-4 sm:px-6">
          <button
            aria-label="Open navigation"
            className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-4" />
          </button>

          <div className="relative hidden lg:flex items-center flex-1 max-w-md">
            <Search className="absolute left-3 size-4 text-muted-foreground" />
            <input
              placeholder="Search projects, tasks, people…"
              className="w-full rounded-md border border-border bg-input-background pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex-1 lg:hidden" />

          {/* Role switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex min-w-0 items-center gap-2 rounded-md border border-border bg-card px-2 py-2 text-sm hover:border-primary/40 sm:px-3">
                <span className="hidden text-muted-foreground text-xs font-mono sm:inline">VIEW AS</span>
                <span className="max-w-[7rem] truncate font-medium sm:max-w-none">{ROLE_LABEL[role]}</span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <DropdownMenuItem key={r} onClick={() => setRole(r)}>
                  {ROLE_LABEL[r]}
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
              <div className="border-b border-border px-4 py-3 font-medium">Notifications</div>
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

          <div className="flex items-center gap-2 pl-0 sm:pl-2">
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
                  {item.label}
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
