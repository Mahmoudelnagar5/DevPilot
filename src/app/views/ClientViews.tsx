import { useState } from "react";
import { useApp } from "../AppContext";
import { useAuth } from "../AuthContext";
import { useLanguage } from "../LanguageContext";
import {
  personById, messages, CURRENT_USER, type Project,
} from "../data/mock";
import { PageHeader } from "../components/Shell";
import {
  Panel, StatCard, ScoreRing, ProgressBar, StatusPill, Mono, money, AiTag, SectionTitle,
} from "../components/shared";
import { ProjectPlan } from "../components/ProjectPlan";
import { BookTQAMeetingDialog } from "../components/BookTQAMeetingDialog";
import { TrustLayer } from "../components/TrustLayer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { groqChatStream } from "../lib/groq";

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import {
  Activity, TrendingUp, Wallet, Send, Check, X, Plus, ArrowRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export function ClientViews() {
  const { page } = useApp();
  switch (page) {
    case "dashboard": return <ClientDashboard />;
    case "project": return <ClientProject />;
    case "milestones": return <ClientMilestones />;
    case "invoices": return <ClientInvoices />;
    case "messages": return <MessagesView />;
    case "team": return <TeamView />;
    case "trust": return <TrustLayer />;
    default: return <ClientDashboard />;
  }
}

function ClientDashboard() {
  const { t } = useLanguage();
  const { openProject, projects } = useApp();
  const { profile, user: authUser } = useAuth();
  const avgHealth = projects.length ? Math.round(projects.reduce((s, p) => s + p.health, 0) / projects.length) : 0;
  const committed = projects.reduce((s, p) => s + p.budgetHigh, 0);
  const spent = projects.reduce((s, p) => s + p.spent, 0);
  const inExecution = projects.filter((p) => p.status === "in-progress").length;
  const awaiting = projects.filter((p) => p.status === "tm-review" || p.status === "client-approval").length;
  
  // Get user name from profile or auth metadata
  const userName = profile?.full_name || (authUser?.user_metadata?.full_name as string) || authUser?.email?.split("@")[0] || "User";
  const greeting = `${t("client.welcome")}, ${userName}`;
  
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={greeting}
        subtitle={t("client.welcomeSub")}
        action={<NewProjectDialog />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("client.activeProjects")} value={projects.length} sub={`${inExecution} ${t("client.inExecution")} · ${awaiting} ${t("client.awaitingApproval")}`} icon={<Activity className="size-4" />} />
        <StatCard label={t("client.avgHealth")} value={avgHealth} accent="success" sub={t("client.compositeAiScore")} icon={<TrendingUp className="size-4" />} />
        <StatCard label={t("client.committedBudget")} value={money(committed)} sub={`${money(spent)} ${t("plan.spent")}`} icon={<Wallet className="size-4" />} />
        <StatCard label={t("client.nextMilestone")} value="Aug 1" accent="warning" sub="Bank Reconciliation" />
      </div>

      <SectionTitle hint={t("client.clickCardToOpen")}>{t("client.projects")}</SectionTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((proj) => (
          <ProjectCard key={proj.id} project={proj} onOpen={() => openProject(proj.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  const { t } = useLanguage();
  return (
    <button onClick={onOpen} className="group text-left">
      <Panel className="overflow-hidden transition-colors group-hover:border-primary/40">
        <div className="relative h-32 bg-muted">
          <ImageWithFallback src={p.cover} alt={p.name} className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <div>
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground font-mono">{p.domain}</div>
            </div>
            <StatusPill status={p.status} />
          </div>
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <ScoreRing score={p.health} label={t("client.healthLabel")} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("common.progress")}</span><Mono>{p.progress}%</Mono>
              </div>
              <ProgressBar value={p.progress} className="mt-1" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("common.budget")}</span>
              <Mono>{money(p.budgetLow)}–{money(p.budgetHigh)}</Mono>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("common.risk")}</span>
              <span className="flex items-center gap-2">
                <Mono className={p.riskScore > 50 ? "text-destructive" : p.riskScore > 30 ? "text-warning" : "text-success"}>{p.riskScore}/100</Mono>
              </span>
            </div>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </div>
      </Panel>
    </button>
  );
}

function NewProjectDialog() {
  const { addProject, openProject, projects } = useApp();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "chat" | "final">("initial");
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refinedData, setRefinedData] = useState<{
    name: string;
    description: string;
    platform?: string;
    techStack?: string;
    features?: string[];
    conversationSummary?: string;
  } | null>(null);

  const reset = () => { 
    setName(""); 
    setIdea(""); 
    setStep("initial");
    setChatMessages([]);
    setChatInput("");
    setRefinedData(null);
  };

  const startChat = () => {
    if (!name.trim() || !idea.trim()) return;
    setStep("chat");
    // Initial AI message
    setChatMessages([{
      role: "ai",
      text: `شكراً! عشان أفهم فكرتك أحسن و أطلع requirements دقيقة، عندي شوية أسئلة:\n\n1️⃣ أنت محتاج تطبيق إيه؟\n   • تطبيق ويب (Web Application)\n   • تطبيق موبايل (iOS/Android)\n   • تطبيق ديسكتوب\n   • أكتر من واحد من دول\n\n2️⃣ عندك تكنولوجي معينة تحب تستخدمها؟ (مثلاً: React، Vue، Node.js، Python، إلخ)\nلو مش عارف، قولي و أنا هقترح عليك الأنسب! 👍`
    }]);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || loading) return;
    
    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      // Build conversation context for Groq
      const conversationHistory = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "assistant" as const,
        content: m.text
      }));
      
      // Add system context
      const systemPrompt = `أنت مساعد ذكي متخصص في تحليل وتوضيح أفكار المشاريع التقنية.
      
معلومات المشروع الحالية:
- اسم المشروع: ${name}
- الوصف الأولي: ${idea}

مهمتك:
1. اسأل أسئلة توضيحية محددة لفهم الفكرة بشكل أفضل (Platform، Technology Stack، User Types، Core Features، Timeline، Budget)
2. بعد 3-4 تبادلات، اجمع كل المعلومات وأعلمني أن التوضيح اكتمل
3. استخدم اللغة العربية بشكل طبيعي وودود
4. ركّز على جمع معلومات محددة وعملية

قواعد:
- إذا جمعت معلومات كافية عن (Platform + Tech Stack + User Types + Core Features)، قل: "✅ REFINEMENT_COMPLETE" في بداية ردك
- لا تطرح أكثر من سؤالين في المرة الواحدة
- كن محدداً في أسئلتك`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory,
        { role: "user" as const, content: userMessage }
      ];

      // Add placeholder for streaming AI response
      setChatMessages(prev => [...prev, { role: "ai", text: "" }]);

      // Call Groq API with streaming
      let aiResponse = "";
      await groqChatStream(messages, (chunk) => {
        aiResponse += chunk;
        // Update ONLY the last message (the AI response)
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "ai", text: aiResponse };
          return updated;
        });
      });

      // Check if refinement is complete
      if (aiResponse.includes("✅ REFINEMENT_COMPLETE") || aiResponse.includes("REFINEMENT_COMPLETE")) {
        // Build full conversation context for extraction
        const fullConversation = [...chatMessages, { role: "user", text: userMessage }, { role: "ai", text: aiResponse }];
        
        // Extract platform info from conversation
        const conversationText = fullConversation.map(m => m.text.toLowerCase()).join(" ");
        let platform = "To be determined";
        let techStack = "To be determined";
        
        // Detect platform
        if (conversationText.includes("موبايل") || conversationText.includes("mobile") || conversationText.includes("ios") || conversationText.includes("android")) {
          platform = "Mobile (iOS/Android)";
          techStack = "React Native / Flutter + Node.js Backend";
        } else if (conversationText.includes("ويب") || conversationText.includes("web")) {
          platform = "Web Application";
          techStack = "React + Node.js";
        } else if (conversationText.includes("ديسكتوب") || conversationText.includes("desktop")) {
          platform = "Desktop Application";
          techStack = "Electron + React";
        }
        
        // Detect hardware/IoT
        if (conversationText.includes("esp") || conversationText.includes("بصمة") || conversationText.includes("fingerprint") || conversationText.includes("sensor")) {
          techStack = `${techStack} + ESP32/Arduino (Fingerprint Sensor) + MQTT/BLE`;
        }
        
        // Build enhanced description with conversation summary
        const conversationSummary = fullConversation
          .filter(m => m.role === "user")
          .map((m, i) => `Q${i + 1}: ${m.text}`)
          .join("\n");
        
        setRefinedData({
          name: name.trim(),
          description: idea.trim(),
          platform,
          techStack,
          features: [],
          conversationSummary
        });
        setStep("final");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error in AI conversation:", error);
      setChatMessages(prev => {
        // Update the last AI message with error
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === "ai") {
          updated[updated.length - 1] = {
            role: "ai",
            text: "عذراً، حدث خطأ في الاتصال بالـ AI. حاول مرة أخرى."
          };
        } else {
          updated.push({
            role: "ai",
            text: "عذراً، حدث خطأ في الاتصال بالـ AI. حاول مرة أخرى."
          });
        }
        return updated;
      });
      setLoading(false);
    }
  };

  const generateProject = () => {
    if (!refinedData) return;
    
    // Build enhanced description with conversation insights
    const enhancedDescription = `${refinedData.description}

=== Platform & Technology ===
Platform: ${refinedData.platform}
Tech Stack: ${refinedData.techStack}

=== Conversation Insights ===
${refinedData.conversationSummary || 'No additional details'}`;

    const createdProject = addProject({ 
      name: refinedData.name, 
      description: enhancedDescription
    });
    setOpen(false);
    reset();
    toast(t("client.generating"), { icon: "⚡" });
    openProject(createdProject.id);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4" /> {t("client.newProject")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {step === "initial" && t("client.createProjectTitle")}
            {step === "chat" && t("client.clarifyIdea")}
            {step === "final" && t("client.readyToGenerate")}
          </DialogTitle>
          <DialogDescription>
            {step === "initial" && t("client.createProjectDesc")}
            {step === "chat" && t("client.answerQuestions")}
            {step === "final" && t("client.reviewInfo")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {step === "initial" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("client.projectName")}</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("client.projectNamePlaceholder")} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("client.description")}</label>
                <Textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={5}
                  placeholder={t("client.descriptionPlaceholder")}
                />
              </div>
            </div>
          )}

          {step === "chat" && (
            <div className="flex flex-col gap-3 h-full min-h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-foreground"
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed">{msg.text.replace("✅ REFINEMENT_COMPLETE", "").trim()}</div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <span className="inline-block size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                        <span className="inline-block size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                        <span className="inline-block size-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="اكتب إجابتك هنا..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !chatInput.trim()} size="icon">
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "final" && refinedData && (
            <div className="space-y-4">
              <div className="rounded-lg border p-5 space-y-4 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="space-y-1 pb-3 border-b">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">اسم المشروع</span>
                  <p className="text-lg font-semibold">{refinedData.name}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">الوصف</span>
                  <p className="text-sm leading-relaxed">{refinedData.description}</p>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      📱 Platform
                    </span>
                    <p className="text-sm font-medium bg-muted/50 px-3 py-2 rounded-md">{refinedData.platform || "To be determined"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                      🛠️ Tech Stack
                    </span>
                    <p className="text-xs font-mono bg-muted/50 px-3 py-2 rounded-md leading-relaxed">{refinedData.techStack || "To be determined"}</p>
                  </div>
                </div>

                {refinedData.conversationSummary && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">📝 ملخص المحادثة</span>
                    <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md max-h-40 overflow-y-auto space-y-1 leading-relaxed">
                      {refinedData.conversationSummary.split('\n').map((line, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-900 p-4">
                <div className="text-blue-600 dark:text-blue-400 text-lg mt-0.5">✨</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    جاهز للتوليد!
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    هنستخدم الذكاء الاصطناعي لتوليد: Requirements، User Stories، Architecture، ERD، Squad Recommendation، Sprint Plan، Risk Analysis، و Cost/Timeline Estimates
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-muted/50 border p-3">
                <div className="text-muted-foreground text-sm mt-0.5">💡</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  بعد التوليد، هتقدر تعدل أي تفاصيل من خلال الـ <strong>AI Assistant</strong> 💬 (User Stories، Requirements، Milestones، Budget، وأكتر)
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "initial" && (
            <Button onClick={startChat} disabled={!name.trim() || !idea.trim()}>
              {t("client.startChat")}
            </Button>
          )}
          {step === "chat" && (
            <Button variant="outline" onClick={() => setStep("initial")}>
              {t("client.back")}
            </Button>
          )}
          {step === "final" && (
            <>
              <Button variant="outline" onClick={() => setStep("chat")}>
                {t("client.editAnswers")}
              </Button>
              <Button onClick={generateProject}>
                {t("client.generateBtn")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ClientProject() {
  const { t } = useLanguage();
  const { projectId, getProject, projects, updateProjectStatus } = useApp();
  const p = getProject(projectId) || projects[0];
  const awaitingClient = p?.status === "client-approval";
  const inReviewByTM = p?.status === "tm-review";
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title={t("client.projectPlan")}
        subtitle={t("client.projectPlanSub")}
        action={
          p && (
            <div className="flex flex-wrap items-center gap-2">
              <BookTQAMeetingDialog projectName={p.name} />
              {awaitingClient ? (
                <>
                  <Button variant="outline" onClick={() => { updateProjectStatus(p.id, "tm-review"); toast("Sent back to your Technical Manager with comments."); }}>
                    <X className="size-4" /> {t("client.requestChanges")}
                  </Button>
                  <Button onClick={() => { updateProjectStatus(p.id, "in-progress"); toast.success("Plan approved — the team is starting execution! 🎉"); }}>
                    <Check className="size-4" /> {t("client.approveStart")}
                  </Button>
                </>
              ) : inReviewByTM ? (
                <span className="rounded-md border border-warning/25 bg-warning/10 px-3 py-1.5 text-sm text-warning">
                  {t("client.awaitingTMReview")}
                </span>
              ) : null}
            </div>
          )
        }
      />
      <ProjectPlan projectId={projectId} />
    </div>
  );
}

function ClientMilestones() {
  const { t } = useLanguage();
  const { projectId, getProject, projects, addLedgerEntry } = useApp();
  const p = getProject(projectId) || projects[0];
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});
  if (!p) return <div className="p-6 text-muted-foreground">{t("common.selectProjectFirst")}</div>;
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title={t("client.milestonesTitle")} subtitle={`${p.name} — approve deliverables to release payment.`} />
      <div className="space-y-4">
        {p.milestones.map((m) => {
          const decision = decided[m.id];
          const canAct = m.status === "in-review";
          return (
            <Panel key={m.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3>{m.name}</h3>
                    <StatusPill status={decision ?? m.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{t("common.due")} {new Date(m.due).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <Mono>{money(m.amount)}</Mono>
                  </div>
                  <div className="mt-3 max-w-md">
                    <ProgressBar value={m.progress} />
                    <div className="mt-1 text-xs text-muted-foreground font-mono">{m.progress}% {t("client.complete")}</div>
                  </div>
                </div>
                {canAct && !decision && (
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" onClick={() => { setDecided((d) => ({ ...d, [m.id]: "rejected" })); addLedgerEntry({ projectId, category: "milestone", title: `${m.name} changes requested`, detail: "Client declined the current deliverable and returned it for revision.", status: "rejected" }); toast("Milestone sent back with comments."); }}>
                      <X className="size-4" /> Request changes
                    </Button>
                    <Button onClick={() => { setDecided((d) => ({ ...d, [m.id]: "approved" })); addLedgerEntry({ projectId, category: "milestone", title: `${m.name} approved`, detail: `${money(m.amount)} payment release authorized after deliverable review.`, status: "approved" }); toast.success(`Approved — ${money(m.amount)} released.`); }}>
                      <Check className="size-4" /> Approve & pay
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

function ClientInvoices() {
  const { t } = useLanguage();
  const { projectId, getProject, projects } = useApp();
  const p = getProject(projectId) || projects[0];
  if (!p) return <div className="p-6 text-muted-foreground">Select a project first.</div>;
  const total = p.invoices.reduce((s, i) => s + i.amount, 0);
  const paid = p.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title={t("invoices.title")} subtitle={p.name} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label={t("client.totalInvoiced")} value={money(total)} icon={<Wallet className="size-4" />} />
        <StatCard label={t("client.paid")} value={money(paid)} accent="success" />
        <StatCard label={t("client.outstanding")} value={money(total - paid)} accent="warning" />
      </div>
      <Panel className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("client.invoice")}</TableHead>
              <TableHead>{t("client.milestone")}</TableHead>
              <TableHead>{t("client.issued")}</TableHead>
              <TableHead>{t("client.amount")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {p.invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell><Mono>{inv.number}</Mono></TableCell>
                <TableCell>{inv.milestone}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(inv.issued).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
                <TableCell><Mono>{money(inv.amount)}</Mono></TableCell>
                <TableCell><StatusPill status={inv.status} /></TableCell>
                <TableCell className="text-right">
                  {inv.status === "due" ? (
                    <Button size="sm" onClick={() => toast.success(`Payment of ${money(inv.amount)} initiated.`)}>{t("invoices.payNow")}</Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </div>
  );
}

export function MessagesView() {
  const { t } = useLanguage();
  const [list, setList] = useState(messages);
  const [text, setText] = useState("");
  const me = "u-nadia";
  const send = () => {
    if (!text.trim()) return;
    setList((l) => [...l, { id: "m" + Date.now(), from: me, text, time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setText("");
  };
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title={t("client.messagesTitle")} subtitle={`LedgerLoop — ${t("client.messagesSubtitle")}`} />
      <Panel className="flex h-[calc(100dvh-14.5rem)] min-h-[26rem] flex-col sm:h-[calc(100dvh-13rem)]">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {list.map((m) => {
            const person = personById(m.from)!;
            const mine = m.from === me;
            return (
              <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                <Avatar className="size-8"><AvatarImage src={person.avatar} /><AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div className={`max-w-[82%] sm:max-w-[70%] ${mine ? "text-right" : ""}`}>
                  <div className="mb-1 text-xs text-muted-foreground"><span className="text-foreground">{person.name.split(" ")[0]}</span> · {m.time}</div>
                  <div className={`rounded-lg px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t("client.messagePlaceholder")} />
          <Button onClick={send}><Send className="size-4" /></Button>
        </div>
      </Panel>
    </div>
  );
}

export function TeamView() {
  const { t } = useLanguage();
  const { projectId, getProject, projects } = useApp();
  const p = getProject(projectId) || projects[0];
  if (!p) return <div className="p-6 text-muted-foreground">Select a project first.</div>;
  return (
    <div className="p-4 sm:p-6">
      <PageHeader title={t("client.teamTitle")} subtitle={`${p.name} — ${t("client.teamSubtitle")}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {p.team.map((id) => {
          const m = personById(id)!;
          return (
            <Panel key={id} className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-12"><AvatarImage src={m.avatar} /><AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback></Avatar>
                <div>
                  <div className="font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.title}</div>
                </div>
              </div>
              {m.skills && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.skills.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">{s}</span>
                  ))}
                </div>
              )}
              {m.availability != null && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground"><span>{t("common.availability")}</span><Mono>{m.availability}%</Mono></div>
                  <ProgressBar value={m.availability} className="mt-1" />
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
