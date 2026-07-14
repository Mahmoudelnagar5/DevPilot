import { useState } from "react";
import { useApp } from "../AppContext";
import {
  platformStats, mrrTrend, aiUsageByFeature, platformUsers, plans,
  supportTickets, personById, type PlatformUser,
} from "../data/mock";
import { PageHeader } from "../components/Shell";
import { Panel, StatCard, StatusPill, Mono, money, ProgressBar, SectionTitle } from "../components/shared";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Users, DollarSign, TrendingDown, Sparkles, Search, MoreVertical, Check, Ban,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart,
} from "recharts";
import { toast } from "sonner";
import { cn } from "../components/ui/utils";

export function AdminViews() {
  const { page } = useApp();
  switch (page) {
    case "analytics": return <Analytics />;
    case "users": return <UsersAdmin />;
    case "projects": return <ProjectsAdmin />;
    case "plans": return <PlansAdmin />;
    case "support": return <Support />;
    case "settings": return <PlatformSettings />;
    default: return <Analytics />;
  }
}

const chartTheme = {
  grid: "rgba(255,255,255,0.06)",
  axis: "#8896a8",
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 font-mono text-muted-foreground">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={`${p.dataKey ?? p.name}-${i}`} className="flex items-center gap-2">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <Mono>{p.value.toLocaleString()}</Mono>
        </div>
      ))}
    </div>
  );
}

function Analytics() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Platform Analytics" subtitle="DevPilot Ops — live platform health" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={platformStats.activeProjects} icon={<Sparkles className="size-4" />} />
        <StatCard label="MRR" value={money(platformStats.mrr)} accent="success" sub="+5.5% MoM" icon={<DollarSign className="size-4" />} />
        <StatCard label="Churn" value={`${platformStats.churn}%`} accent="warning" sub="−0.1pt MoM" icon={<TrendingDown className="size-4" />} />
        <StatCard label="AI Spend" value={money(platformStats.aiCost)} sub={`${platformStats.aiCalls.toLocaleString()} calls`} icon={<Sparkles className="size-4" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <SectionTitle hint="last 7 months">MRR Growth</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mrrTrend} margin={{ left: -10, right: 8 }}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="mrr" name="MRR" stroke="var(--chart-1)" strokeWidth={2} fill="var(--chart-1)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="p-5">
          <SectionTitle hint="churn %">Churn Trend</SectionTitle>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={mrrTrend} margin={{ left: -20, right: 8 }}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="month" stroke={chartTheme.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="churn" name="Churn" stroke="var(--chart-5)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <SectionTitle hint="calls this month">AI Usage by Feature</SectionTitle>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={aiUsageByFeature} margin={{ left: -10, right: 8 }}>
              <CartesianGrid stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="feature" stroke={chartTheme.axis} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={chartTheme.axis} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="calls" name="Calls" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="p-5">
          <SectionTitle>User Base</SectionTitle>
          <div className="space-y-4">
            {[
              { label: "Developers", val: platformStats.users.developers, total: 1600, color: "var(--chart-1)" },
              { label: "Clients", val: platformStats.users.clients, total: 1600, color: "var(--chart-2)" },
              { label: "Technical Managers", val: platformStats.users.tms, total: 1600, color: "var(--chart-3)" },
            ].map((u) => (
              <div key={u.label}>
                <div className="flex justify-between text-sm"><span>{u.label}</span><Mono>{u.val.toLocaleString()}</Mono></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${(u.val / u.total) * 100}%`, background: u.color }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function UsersAdmin() {
  const [users, setUsers] = useState(platformUsers);
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.includes(q.toLowerCase()));
  const setStatus = (id: string, status: PlatformUser["status"]) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, status } : u)));
    toast.success(`User ${status}`);
  };
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="User Management" subtitle={`${users.length} users — verify, suspend, edit roles`} />
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users…" className="pl-9" />
      </div>
      <Panel className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead>
              <TableHead>Projects</TableHead><TableHead>Joined</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{u.email}</TableCell>
                <TableCell className="capitalize">{u.role === "tm" ? "Tech Manager" : u.role}</TableCell>
                <TableCell><Mono>{u.projects}</Mono></TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(u.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</TableCell>
                <TableCell><StatusPill status={u.status} /></TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {u.status === "pending" && <DropdownMenuItem onClick={() => setStatus(u.id, "active")}><Check className="size-4" /> Verify</DropdownMenuItem>}
                      {u.status !== "suspended" ? (
                        <DropdownMenuItem onClick={() => setStatus(u.id, "suspended")}><Ban className="size-4" /> Suspend</DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => setStatus(u.id, "active")}><Check className="size-4" /> Reinstate</DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

function ProjectsAdmin() {
  const { projects } = useApp();
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Project Oversight" subtitle="All projects across the platform" />
      <Panel className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead><TableHead>Client</TableHead><TableHead>Stage</TableHead>
              <TableHead>Health</TableHead><TableHead>Budget</TableHead><TableHead>Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{personById(p.client)?.name}</TableCell>
                <TableCell><StatusPill status={p.status} /></TableCell>
                <TableCell><Mono className={p.health >= 75 ? "text-success" : "text-warning"}>{p.health}</Mono></TableCell>
                <TableCell><Mono>{money(p.budgetLow)}–{money(p.budgetHigh)}</Mono></TableCell>
                <TableCell><Mono className={p.riskScore > 45 ? "text-destructive" : "text-warning"}>{p.riskScore}</Mono></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

function PlansAdmin() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Subscription Plans" subtitle="Tiers, limits, and active subscribers" />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Panel key={p.name} className={cn("p-6", p.highlight && "border-primary/40")}>
            <div className="flex items-center justify-between">
              <h3>{p.name}</h3>
              {p.highlight && <StatusPill status="active" />}
            </div>
            <div className="mt-2 font-display text-3xl font-semibold">{p.price === 0 ? "Free" : money(p.price)}<span className="text-sm text-muted-foreground font-sans">/mo</span></div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Check className="size-4 text-success" /> {p.projects} projects</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-success" /> {p.seats} seats</div>
              <div className="flex items-center gap-2"><Check className="size-4 text-success" /> {p.ai}</div>
            </div>
            <div className="mt-4 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">Active subscribers</span>
              <div className="font-display text-xl font-semibold text-primary">{p.active}</div>
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => toast("Plan editor opened")}>Edit plan</Button>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function Support() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title="Support Queue" subtitle="Tickets across the platform" />
      <Panel className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead><TableHead>Subject</TableHead><TableHead>User</TableHead>
              <TableHead>Priority</TableHead><TableHead>Age</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {supportTickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell><Mono className="text-primary">{t.id}</Mono></TableCell>
                <TableCell>{t.subject}</TableCell>
                <TableCell className="text-muted-foreground">{t.user}</TableCell>
                <TableCell><StatusPill status={t.priority} /></TableCell>
                <TableCell className="text-muted-foreground font-mono text-sm">{t.age}</TableCell>
                <TableCell><StatusPill status={t.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

function PlatformSettings() {
  const [flags, setFlags] = useState({ aiCodeReview: true, autoRisk: true, meetingSummaries: false, i18n: true });
  return (
    <div className="max-w-2xl p-4 sm:p-6">
      <PageHeader title="Platform Settings" subtitle="Feature flags, AI provider config, rate limits" />
      <Panel className="p-5 mb-4">
        <SectionTitle>Feature Flags</SectionTitle>
        <div className="space-y-3">
          {Object.entries({ aiCodeReview: "AI Code Review", autoRisk: "Automatic Risk Recalculation", meetingSummaries: "Meeting Summaries (beta)", i18n: "Internationalization" }).map(([k, label]) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <span className="text-sm">{label}</span>
              <button
                onClick={() => setFlags((f) => ({ ...f, [k]: !f[k as keyof typeof f] }))}
                className={cn("h-6 w-11 rounded-full transition-colors relative", flags[k as keyof typeof flags] ? "bg-primary" : "bg-switch-background")}
              >
                <span className={cn("absolute top-0.5 size-5 rounded-full bg-white transition-transform", flags[k as keyof typeof flags] ? "translate-x-5" : "translate-x-0.5")} />
              </button>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="p-5">
        <SectionTitle>AI Provider</SectionTitle>
        <div className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-muted-foreground">Provider</span><Mono>Google Gemini</Mono></div>
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-muted-foreground">Model</span><Mono>gemini-2.5-pro</Mono></div>
          <div>
            <label className="mb-1.5 block text-muted-foreground">API Key</label>
            <Input type="password" defaultValue="YOUR_API_KEY_HERE" className="font-mono" />
            <p className="mt-1 text-xs text-muted-foreground">Replace with your real Gemini API credentials.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-muted-foreground">Rate limit (req/min)</label>
            <Input defaultValue="600" className="font-mono max-w-[120px]" />
          </div>
        </div>
        <Button className="mt-4" onClick={() => toast.success("Settings saved")}>Save</Button>
      </Panel>
    </div>
  );
}
