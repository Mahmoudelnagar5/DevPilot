import { type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowRight, ArrowDown, Search, FileText, ListChecks, KanbanSquare, Boxes, GitBranch,
  Users, ShieldAlert, CalendarClock, DollarSign, MessageSquare, BookOpen,
  GitPullRequest, BarChart3, Bot, Check, X, Sparkles, FileClock, Globe,
} from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import { PipelineDemo } from "./PipelineDemo";
import { useLanguage } from "../../LanguageContext";

function getNavLinks(isAr: boolean) {
  return [
    { href: "#how-it-works", label: isAr ? "كيف يعمل النظام" : "How it works" },
    { href: "#comparison", label: isAr ? "لماذا DevPilot" : "Why DevPilot" },
    { href: "#features", label: isAr ? "ميزات الذكاء الاصطناعي" : "AI features" },
    { href: "#pricing", label: isAr ? "الأسعار والخطط" : "Pricing" },
    { href: "#human-oversight", label: isAr ? "الإشراف البشري" : "Human oversight" },
  ];
}

function getLifecycleSteps(isAr: boolean) {
  return [
    { title: isAr ? "صف فكرتك" : "Describe the idea", detail: isAr ? "يكتب العميل فكرته بلغة بسيطة، أو يرفع ملف المواصفات/رابط Figma." : "The client writes it in plain language, or uploads a spec / Figma link." },
    { title: isAr ? "الذكاء الاصطناعي يحللها" : "AI analyzes it", detail: isAr ? "المتطلبات، قصص المستخدم، المعمارية البرمجية، مخطط البيانات (ERD)، تقدير التكلفة والجدول الزمني، خطة السبرنتات وتقارير المخاطر — يتم إعدادها تلقائياً." : "Requirements, user stories, architecture, ERD, cost range, timeline, milestones, sprint plan and a risk report — drafted automatically." },
    { title: isAr ? "مراجعة الإشراف البشري" : "Human oversight reviews it", detail: isAr ? "يقوم المدير التقني بمراجعة الخطة وتعيين المطورين — الذكاء الاصطناعي يرتب المرشحين والمدير يعتمد." : "A human lead edits the plan and assigns developers — the AI ranks candidates, the manager confirms." },
    { title: isAr ? "موافقة العميل" : "The client approves", detail: isAr ? "أو إعادتها مع ملاحظات؛ ليقوم الذكاء الاصطناعي بإعادة الصياغة بناءً عليها." : "Or sends it back with feedback; the AI redrafts around it." },
    { title: isAr ? "المطورون يبنون في سبرنتات" : "Developers build in sprints", detail: isAr ? "تذاكر كانبان واضحة، تتبع الوقت، وتسليمات مرتبطة بالمراحل الرئيسية." : "Clear Kanban tickets, time tracking, deliverables tied to milestones." },
    { title: isAr ? "الذكاء الاصطناعي يراقب" : "AI keeps watch", detail: isAr ? "كل طلب سحب كود (PR) يتم فحصه، تحديث درجة صحة المشروع، والتنبيه المبكر لمخاطر التأخير." : "Every pull request gets reviewed, the health score updates, delay risk is flagged early." },
    { title: isAr ? "اعتماد المراحل الرئيسية" : "Milestones get approved", detail: isAr ? "المدير التقني يعتمد الجودة، والعميل يعتمد المرحلة ويدفع المستحقات." : "The manager signs off on quality, the client signs off on the milestone and releases payment." },
    { title: isAr ? "تقارير شاملة للجميع" : "Everyone gets reporting", detail: isAr ? "يحصل العملاء والمدراء على تقارير دورية، والإدارة على تحليلات شاملة للمنصة." : "Clients and managers get recurring status reports; admins get platform-wide analytics." },
  ];
}

function getComparisonRows(isAr: boolean) {
  return [
    { capability: isAr ? "تحويل الفكرة إلى متطلبات مكتوبة" : "Turns an idea into written requirements", clickup: false, devpilot: true },
    { capability: isAr ? "تقدير التكلفة والجدول الزمني" : "Estimates cost and timeline", clickup: false, devpilot: true },
    { capability: isAr ? "تصميم المعمارية البرمجية ومخطط العلاقات (ERD)" : "Drafts architecture and an ER diagram", clickup: false, devpilot: true },
    { capability: isAr ? "مراجعة كل طلب سحب كود (PR)" : "Reviews every pull request", clickup: false, devpilot: true },
    { capability: isAr ? "التنبؤ بمخاطر التأخير قبل حدوثها" : "Predicts delay risk before it happens", clickup: false, devpilot: true },
    { capability: isAr ? "مطابقة المطورين للمهام حسب المهارة" : "Matches developers to tasks by skill", clickup: false, devpilot: true },
    { capability: isAr ? "تنظيم اللوحات والسبرنتات والتذاكر" : "Organizes boards, sprints and tickets", clickup: true, devpilot: true },
    { capability: isAr ? "مصمم للمؤسسين غير التقنيين وليس لفرق الهندسة الحالية فقط" : "Built for non-technical founders, not existing eng teams", clickup: false, devpilot: true },
  ];
}

function getAiFeatures(isAr: boolean) {
  return [
    {
      icon: Search, label: isAr ? "مُحلل المشاريع" : "Project Analyzer",
      desc: isAr ? "يفحص فكرتك ويحدد النطاق والمخاطر والأجزاء المفقودة قبل كتابة سطر كود واحد." : "Scans your idea and identifies scope, risks, and missing pieces before writing a line of code.",
      example: isAr ? 'مثال: "بناء تطبيق أوبر للكلاب" ← يكتشف تعقيدات المدفوعات والـ GPS والتحقق.' : 'e.g. "Build an Uber for dogs" → finds hidden complexity around payments, GPS, and vet verification.',
    },
    {
      icon: FileText, label: isAr ? "مولد المتطلبات" : "Requirement Generator",
      desc: isAr ? "يحول الفكرة المكونة من جملة واحدة إلى قصص مستخدم مهيكلة مع معايير القبول." : "Turns a one-sentence idea into structured user stories with acceptance criteria.",
      example: isAr ? 'مثال: "إضافة تسجيل الدخول" ← يولد قصص تسجيل الدخول الموحد، استعادة كلمة المرور، و2FA.' : 'e.g. "Add login" → generates SSO, password reset, 2FA, and role-based access stories.',
    },
    {
      icon: ListChecks, label: isAr ? "مولد قصص المستخدم" : "User Story Generator",
      desc: isAr ? "يجزئ الميزات إلى قصص مستخدم تفصيلية وقابلة للاختبار مع الأولويات وتقدير الجهد." : "Breaks features into granular, testable user stories with priority and effort estimates.",
      example: isAr ? 'مثال: "مسار الدفع" ← ينشئ قصصاً منفصلة لإنهاء الطلب، الفواتير، الاسترداد، والعملات.' : 'e.g. "Payment flow" → creates separate stories for checkout, receipts, refunds, and currency.',
    },
    {
      icon: KanbanSquare, label: isAr ? "مخطط السبرنتات" : "Sprint Planner",
      desc: isAr ? "ينظم العمل في سبرنتات واقعية بناءً على سرعة الفريق وسلسلة الاعتماديات." : "Organizes work into realistic sprints based on team velocity and dependency chains.",
      example: isAr ? 'مثال: يكتشف وجوب بناء الـ API قبل البدء بالواجهة الأمامية ويرتب المواعيد بناءً على ذلك.' : 'e.g. Detects that API must be built before frontend work can start, schedules accordingly.',
    },
    {
      icon: Boxes, label: isAr ? "مولد المعمارية البرمجية" : "Architecture Generator",
      desc: isAr ? "يقترح معمارية نظام قابلة للتوسع مع توصيات الحزمة التقنية (Tech Stack)." : "Proposes a scalable system architecture with tech stack recommendations.",
      example: isAr ? 'مثال: يقترح Next.js + PostgreSQL + Redis لمنصة SaaS، ويشرح المقايضات.' : 'e.g. Recommends Next.js + PostgreSQL + Redis for a SaaS dashboard, explains trade-offs.',
    },
    {
      icon: GitBranch, label: isAr ? "مولد مخطط العلاقات (ERD)" : "ER Diagram Generator",
      desc: isAr ? "يولد مخططات قاعدة البيانات والعلاقات تلقائياً من المتطلبات." : "Auto-generates entity-relationship diagrams from your requirements.",
      example: isAr ? 'مثال: يكتشف المستخدمين، المشاريع، المهام، التعليقات ← يرسم العلاقات والمفاتيح الخارجية.' : 'e.g. Detects Users, Projects, Tasks, Comments → draws relationships and foreign keys.',
    },
    {
      icon: Users, label: isAr ? "مطابقة المطورين" : "Developer Matching",
      desc: isAr ? "يطابق المطورين مع المهام بناءً على المهارات، التوفر، والأداء السابق." : "Matches developers to tasks based on skills, availability, and past performance.",
      example: isAr ? 'مثال: يعين متخصص React لسبرنت الواجهات، ومطور Backend لأعمال الـ API.' : 'e.g. Assigns a React specialist to the frontend sprint, backend dev to API work.',
    },
    {
      icon: ShieldAlert, label: isAr ? "التنبؤ بالمخاطر" : "Risk Prediction",
      desc: isAr ? "ينبه للمخاطر التقنية والزمنية قبل أن تتحول إلى عوائق." : "Flags technical and timeline risks before they become blockers.",
      example: isAr ? 'مثال: "بوابة الدفع الخارجية تتطلب مباركة في أسبوعين" ← ينبه قبل 3 سبرنتات.' : 'e.g. "Third-party payment API has 2-week approval time" → alerts 3 sprints early.',
    },
    {
      icon: CalendarClock, label: isAr ? "توقع الجدول الزمني" : "Timeline Prediction",
      desc: isAr ? "يقدر تواريخ التسليم الواقعية بناءً على المشاريع المشابهة وقدرة الفريق." : "Estimates realistic delivery dates based on similar projects and team capacity.",
      example: isAr ? 'مثال: "MVP في 8 أسابيع" بدلاً من تخمين المطور بـ "4 أسابيع" وتأخر التوقيت.' : 'e.g. "MVP in 8 weeks" instead of a developer guessing "4 weeks" and missing it.',
    },
    {
      icon: DollarSign, label: isAr ? "تقدير الميزانية" : "Budget Estimation",
      desc: isAr ? "يقدم تفاصيل التكاليف حسب الميزة، السبرنت، والدور." : "Provides cost breakdowns by feature, sprint, and role.",
      example: isAr ? 'مثال: "نظام المصادقة: $2,400 | اللوحة الرئيسية: $5,100 | الإجمالي: $18,500 ± 15%".' : 'e.g. "Auth system: $2,400 | Dashboard: $5,100 | Total: $18,500 ± 15%".',
    },
    {
      icon: MessageSquare, label: isAr ? "ملخص الاجتماعات" : "Meeting Summarizer",
      desc: isAr ? "يلخص اجتماعات الوقوف اليومي، مكالمات العملاء، ومراجعات السبرنت." : "Transcribes and summarizes standups, client calls, and sprint reviews.",
      example: isAr ? 'مثال: مكالمة 30 دقيقة ← 5 نقاط موجزة بالقرارات والإجراءات المطلوبة ومسؤوليها.' : 'e.g. 30-min call → 5 bullet points with decisions, action items, and owners.',
    },
    {
      icon: BookOpen, label: isAr ? "مولد التوثيق" : "Documentation Generator",
      desc: isAr ? "يولد وثائق الـ API، ملفات README، والمواصفات التقنية تلقائياً." : "Auto-generates API docs, README files, and technical specifications.",
      example: isAr ? 'مثال: يولد مواصفات OpenAPI من كود الـ API، ويضيف أمثلة الاستخدام.' : 'e.g. Generates OpenAPI spec from your endpoint code, adds usage examples.',
    },
    {
      icon: GitPullRequest, label: isAr ? "مراجعة الكود بالذكاء الاصطناعي" : "AI Code Review",
      desc: isAr ? "يراجع كل طلب سحب كود للتحقق من الأخطاء والإنذارات الأمنية والمعايير." : "Reviews every PR for bugs, security issues, and style violations.",
      example: isAr ? 'مثال: ينبه لمخاطر حقن SQL، يقترح تحسينات الأداء، ويفحص تسميات الدوال.' : 'e.g. Flags SQL injection risk, suggests performance optimization, checks naming conventions.',
    },
    {
      icon: BarChart3, label: isAr ? "مؤشر صحة المشروع" : "Health Score",
      desc: isAr ? "يقيم مشروعك باستمرار على الجدول الزمني، الميزانية، الجودة، والمخاطر." : "Continuously scores your project on timeline, budget, quality, and risk.",
      example: isAr ? 'مثال: "النتيجة: 72/100 — خطورة الوقت مرتفعة، جودة الكود ممتازة".' : 'e.g. "Score: 72/100 — timeline risk high, code quality excellent".',
    },
    {
      icon: Bot, label: isAr ? "مساعد المحادثة الذكي" : "AI Chat Assistant",
      desc: isAr ? "اطرح أسئلة حول مشروعك بلغة طبيعية واحصل على إجابات فورية." : "Ask questions about your project in natural language, get instant answers.",
      example: isAr ? 'مثال: "ما الذي يعطل ميزة المدفوعات؟" ← يعرض سلسلة الاعتماديات والوقت المتوقع.' : 'e.g. "What\'s blocking the payment feature?" → shows dependency chain and ETA.',
    },
  ];
}

function getPlans(isAr: boolean) {
  return [
    {
      name: isAr ? "المجانية" : "Free",
      price: "$0",
      priceNote: isAr ? "/شهرياً" : "/month",
      tagline: isAr ? "تحقق من فكرتك" : "Validate your idea",
      features: isAr ? [
        "مشروع واحد", "تحليل الفكرة", "المتطلبات", "التكلفة والجدول الزمني",
        "تخطيط السبرنتات", "المعمارية", "مراجعة الكود", "سجل القرارات",
        "مؤشر الصحة", "مجتمع الدعم",
      ] : [
        "1 Project", "Idea Analysis", "Requirements", "Cost & Timeline",
        "Sprint Planning", "Architecture", "Code Review", "Decision Ledger",
        "Health Score", "Community",
      ],
      note: isAr ? "الذكاء الاصطناعي يقترح. الإشراف البشري متاح عند الترقية." : "AI Proposes. Human Oversight available when you upgrade.",
      checks: [],
      cta: isAr ? "ابدأ مجاناً" : "Start Free",
      highlighted: false,
    },
    {
      name: isAr ? "الاحترافية" : "Professional",
      price: "$49",
      priceNote: isAr ? "/شهرياً" : "/month",
      tagline: isAr ? "مدير مشاريعك التقني بالذكاء الاصطناعي" : "Your AI Technical Project Manager",
      features: isAr ? [
        "مشاريع غير محدودة", "التخطيط بالذكاء الاصطناعي", "محاكي الأثر", "مدرب Stand-up",
        "مراجعة كود متقدمة", "مراجعة أمنية", "معالجة ذات أولوية",
        "بوابة العملاء", "تصدير الوثائق", "دعم عبر البريد", "إشراف بشري",
      ] : [
        "Unlimited Projects", "AI Planning", "Impact Simulator", "Stand-up Coach",
        "Advanced Code Review", "Security Review", "Priority Processing",
        "Client Portal", "Export Docs", "Email Support", "Human Oversight",
      ],
      checks: [
        isAr ? "مدير تقني يتحقق من القرارات المفصلية عند ارتفاع المخاطر." : "Technical Manager validates critical decisions when risk is high.",
      ],
      cta: isAr ? "ابدأ البناء" : "Start Building",
      highlighted: true,
    },
    {
      name: isAr ? "الفريق" : "Team",
      price: "$199",
      priceNote: isAr ? "/شهرياً" : "/month",
      tagline: isAr ? "الذكاء الاصطناعي + خبرة بشرية" : "AI + Human Expertise",
      features: isAr ? [
        "أعضاء غير محدودين", "مساحة عمل مشتركة", "تحليلات السبرنت",
        "لوحة المخاطر", "اعتماد المعمارية", "أمان متقدم",
        "استشارات المدير التقني", "اتفاقية مستوى الخدمة SLA", "رؤى الفريق", "وصول API",
        "دعم ذو أولوية", "إشراف بشري",
      ] : [
        "Unlimited Members", "Shared Workspace", "Sprint Analytics",
        "Risk Dashboard", "Architecture Validation", "Advanced Security",
        "TM Consultation", "Faster SLA", "Team Insights", "API Access",
        "Priority Support", "Human Oversight",
      ],
      checks: isAr ? [
        "استشارة مباشرة مع مدير تقني معتمد من DevPilot.",
        "اعتماد المعمارية والمراحل الرئيسية.",
      ] : [
        "Direct consultation with a DevPilot Certified Technical Manager.",
        "Architecture & milestone validation.",
      ],
      cta: isAr ? "انمو بشكل أسرع" : "Grow Faster",
      highlighted: false,
    },
    {
      name: isAr ? "المؤسسات" : "Enterprise",
      price: isAr ? "تسعير مخصص" : "Custom Pricing",
      priceNote: "",
      tagline: isAr ? "مكتبك الهندسي الخارجي" : "Your External Engineering Office",
      features: isAr ? [
        "مدير تقني مخصص", "مهندس حلول", "لوحة قيادة تنفيدية",
        "مراجعات أسبوعية", "استشارات CTO", "الامتثال والأمان",
        "نماذج AI مخصصة", "تثبيت محلي On-premise", "تسجيل دخول موحد SSO", "ضمان SLA",
        "مدير نجاح عملاء مخصص", "إشراف بشري",
      ] : [
        "Dedicated TM", "Solution Architect", "Executive Dashboard",
        "Weekly Reviews", "CTO Advisory", "Compliance & Security",
        "Custom AI Models", "On-premise", "SSO", "SLA Guarantee",
        "Dedicated CSM", "Human Oversight",
      ],
      checks: [
        isAr ? "كل قرار تقني مفصلي تحت إشراف فريق الهندسة في DevPilot." : "Every critical technical decision supervised by your DevPilot engineering team.",
      ],
      cta: isAr ? "تواصل مع المبيعات" : "Contact Sales",
      highlighted: false,
    },
  ];
}

function getWhyDevPilotRows(isAr: boolean) {
  return [
    { traditional: isAr ? "الذكاء الاصطناعي يعطيك اقتراحات فقط" : "AI gives suggestions", devpilot: isAr ? "الذكاء الاصطناعي يعطي توصيات معتمدة من مسارات العمل الهندسي" : "AI gives recommendations validated by engineering workflows" },
    { traditional: isAr ? "تتخذ القرارات بمفردك" : "You make decisions alone", devpilot: isAr ? "القرارات المفصلية يمكن مراجعتها بواسطة مدراء تقنيين" : "Critical decisions can be reviewed by Technical Managers" },
    { traditional: isAr ? "غياب الحوكمة للمشروع" : "No project governance", devpilot: isAr ? "سجل القرارات وطبقة الثقة (Decision Ledger & Trust Layer)" : "Decision Ledger & Trust Layer" },
    { traditional: isAr ? "مراجعة كود عامة" : "Generic code review", devpilot: isAr ? "مراجعة كود مرتبطة بسياق ومتطلبات المشروع" : "Context-aware code review tied to project requirements" },
    { traditional: isAr ? "مجرد روبوت محادثة آخر" : "Just another chatbot", devpilot: isAr ? "مدير مشاريع تقني بالذكاء الاصطناعي" : "AI Technical Project Manager" },
  ];
}

function fadeUp(delay = 0): Variants {
  return {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
  };
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={fadeUp(delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.14em] text-primary">
      <Sparkles className="size-3.5" strokeWidth={2} />
      {children}
    </span>
  );
}

function FlowNode({ children, highlight = false }: { children: ReactNode; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border px-5 py-2.5 text-center text-sm font-medium",
        highlight
          ? "border-primary/40 bg-primary/[0.08] text-primary"
          : "border-border bg-card text-foreground"
      )}
    >
      {children}
    </div>
  );
}

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const { lang, toggleLang, t } = useLanguage();
  const isAr = lang === "ar";

  const NAV_LINKS = getNavLinks(isAr);
  const LIFECYCLE_STEPS = getLifecycleSteps(isAr);
  const COMPARISON_ROWS = getComparisonRows(isAr);
  const AI_FEATURES = getAiFeatures(isAr);
  const PLANS = getPlans(isAr);
  const WHY_DEVPILOT_ROWS = getWhyDevPilotRows(isAr);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-display text-sm font-bold">D</div>
            <span className="font-display text-sm font-semibold tracking-tight">{t("app.title")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:border-primary/50 transition-colors"
              title="Switch Language / تغيير اللغة"
            >
              <Globe className="size-3.5 text-primary" />
              <span className="font-semibold">{lang === "en" ? "العربيّة" : "English"}</span>
            </button>
            <Button size="sm" onClick={onEnter} className="shrink-0">
              <span className="hidden sm:inline">{t("landing.enterApp")}</span>
              <span className="sm:hidden">{t("landing.enterApp")}</span>
              <ArrowRight className={`size-3.5 ${isAr ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.15] blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--chart-1), var(--chart-2) 60%, transparent 75%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-24 lg:pb-28">
          <motion.div
            initial={prefersReducedMotion ? undefined : "hidden"}
            animate={prefersReducedMotion ? undefined : "show"}
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div variants={fadeUp()}>
              <Badge variant="outline" className="border-primary/30 text-primary font-mono">
                {isAr ? "مدير مشاريعك التقني بالذكاء الاصطناعي" : "Your AI Technical Project Manager"}
              </Badge>
            </motion.div>
            <motion.h1 variants={fadeUp(0.05)} className="mt-5 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              {isAr ? (
                <>
                  صف فكرتك.
                  <br />
                  DevPilot يدير المشروع.
                </>
              ) : (
                <>
                  Describe the idea.
                  <br />
                  DevPilot runs the project.
                </>
              )}
            </motion.h1>
            <motion.p variants={fadeUp(0.1)} className="mt-5 text-balance text-muted-foreground lg:text-lg">
              {isAr ? (
                "معظم الأدوات تمنحك لوحة فارغة وتترك العمل التقني عليك. DevPilot يصيغ المتطلبات والمعمارية والتكلفة وخطة السبرنتات — ثم يراجع كل سطر كود مع وجود إشراف بشري للقرارات المفصلية."
              ) : (
                "Most tools give you an empty board and leave the technical work to you. DevPilot's AI drafts the requirements, architecture, cost, and sprint plan — then reviews every pull request while human oversight signs off on the parts that matter."
              )}
            </motion.p>
            <motion.div variants={fadeUp(0.15)} className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={onEnter}>
                {isAr ? "افتح لوحة التحكم" : "Launch the dashboard"}
                <ArrowRight className={`size-4 ${isAr ? "rotate-180" : ""}`} />
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">{isAr ? "شاهد كيف يعمل" : "See how it works"}</a>
              </Button>
            </motion.div>
          </motion.div>

          <div className="mt-16">
            <Reveal delay={0.05}>
              <PipelineDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>{isAr ? "المشكلة" : "The problem"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "المؤسسون غير التقنيين لا يستطيعون تقييم العمل التقني." : "Non-technical founders can't evaluate technical work."}
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {isAr ? (
                "منصات العمل الحر تمنحك قائمة بالمستقلين وتترك الفحص والإدارة عليك. وأدوات إدارة المهام تمنحك لوحة فارغة — تنظم العمل لكنها لا تنفذه."
              ) : (
                "Marketplaces like Upwork hand you a list of freelancers and leave the vetting and delivery management to you. Tools like ClickUp or Jira hand you an empty board — they organize the work, they don't do it."
              )}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.05} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-display text-lg font-semibold">{isAr ? "إذا كنت أنت العميل" : "If you're the client"}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {isAr ? (
                  <>
                    <li>• لا يمكنك معرفة ما إذا كان العمل جيداً حقاً أم مجرد مظاهر.</li>
                    <li>• غياب التقدير الحقيقي للتكلفة والمدة الزمنية.</li>
                    <li>• عدم رؤية المخاطر حتى يفوت الموعد المحدد.</li>
                    <li>• خوف مستمر من المبالغة في التكاليف دون قدرة على التقييم.</li>
                  </>
                ) : (
                  <>
                    <li>Can't tell if the work is actually good, or just looks busy.</li>
                    <li>No real sense of what it should cost or how long it should take.</li>
                    <li>No visibility into risk until a deadline is already missed.</li>
                    <li>Constant fear of being overcharged by people you can't technically judge.</li>
                  </>
                )}
              </ul>
            </Reveal>
            <Reveal delay={0.12} className="rounded-xl border border-border bg-card/60 p-6">
              <h3 className="font-display text-lg font-semibold">{isAr ? "إذا كنت أنت المطور" : "If you're the developer"}</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {isAr ? (
                  <>
                    <li>• طلبات عشوائية بدلاً من تذاكر محددة النطاق.</li>
                    <li>• تتبع الوقت والمدفوعات يعتمدان على تذكر شخص ما للدفع.</li>
                    <li>• عميل غير تقني يحاول إدارة القرارات التقنية مباشرة.</li>
                    <li>• ساعات تضيع في كتابة تحديثات الحالة بدلاً من التطوير.</li>
                  </>
                ) : (
                  <>
                    <li>Ad-hoc requests instead of clearly scoped tickets.</li>
                    <li>Time tracking and payment that depend on someone remembering to pay you.</li>
                    <li>A non-technical client trying to manage technical decisions directly.</li>
                    <li>Hours lost writing status updates instead of building.</li>
                  </>
                )}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>{isAr ? "كيف يعمل النظام" : "How it works"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "فكرة واحدة، ثماني خطوات، مشروع مُسلم." : "One idea, eight steps, a delivered project."}
            </h2>
          </Reveal>

          <div className="relative mt-14 grid gap-x-8 gap-y-10 lg:grid-cols-2">
            <div aria-hidden className="absolute left-[15px] top-2 hidden h-[calc(100%-2rem)] w-px bg-border lg:block" />
            {LIFECYCLE_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={(i % 2) * 0.05} className="relative flex gap-4 lg:pl-0">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 font-mono text-xs font-medium text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Layer */}
      <section id="trust-layer" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal className="text-center">
            <SectionEyebrow>{isAr ? "طبقة الثقة" : "Trust Layer"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "لماذا تدع DevPilot يدير مشروعك؟" : "Why let DevPilot run your project?"}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
              {isAr ? (
                "لأن كل تقدير موضح بحالته، وكل قرار مسجل، وكل دفع مالي يتطلب اعتماد طرفين قبل تنفيذه."
              ) : (
                "Because every estimate is labeled, every decision is logged, and every payout is approved by two people before it moves."
              )}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Reveal delay={0.05} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <span className="text-lg font-bold">~</span>
                </div>
                <h3 className="font-display text-base font-semibold">{isAr ? "كل شيء تقديري — وليس ضماناً ثابتاً" : "Everything is an estimate — never a guarantee"}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {isAr ? (
                  "كل تكلفة أو جدول زمني يولدها النظام يتم توضيحها كتقدير وليس وعداً جازماً. يعرض الذكاء الاصطناعي مستوى ثقته وافتراضاته لتعرف مدى الاعتماد عليها."
                ) : (
                  "Every cost, timeline, and risk score DevPilot generates is explicitly labeled as an estimate, not a promise. The AI shows its confidence level and assumptions so you always know how much to trust it."
                )}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <span className="text-lg font-bold">🔒</span>
                </div>
                <h3 className="font-display text-base font-semibold">{isAr ? "الأموال والتوظيف يمران عبر عنصر بشري" : "Money & hiring pass through a human"}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {isAr ? (
                  "يقترح الذكاء الاصطناعي الميزانيات والجداول، لكن لا يتم تحويل أي مبالغ أو تعيين مطورين دون موافقة المدير التقني والعميل معا."
                ) : (
                  "AI proposes budgets and timelines, but no money moves and no developer gets hired without a human Technical Manager and the client both signing off. The AI recommends — the humans decide."
                )}
              </p>
            </Reveal>

            <Reveal delay={0.15} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-lg font-bold">✓✓</span>
                </div>
                <h3 className="font-display text-base font-semibold">{isAr ? "اعتماد مزدوج للجودة والمراحل" : "Dual sign-off on quality and milestones"}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {isAr ? (
                  "يعتمد المدير التقني جودة الكود والمعمارية، بينما يعتمد العميل اكتمال الميزات والمراحل. يلزم موافقة الطرفين لإتمام المرحلة."
                ) : (
                  "The Technical Manager signs off on code quality, architecture, and delivery. The client signs off on milestones and feature completion. Both must approve before a milestone is marked done."
                )}
              </p>
            </Reveal>

            <Reveal delay={0.2} className="rounded-xl border border-border bg-card/50 p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <span className="text-lg font-bold">$</span>
                </div>
                <h3 className="font-display text-base font-semibold">{isAr ? "لا مدفوعات بدون موافقة طرفين" : "No money moves without dual approval"}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {isAr ? (
                  "يتطلب إفراج أي دفعة مالية موافقة العميل والمدير التقني. يراقب الذكاء الاصطناعي الميزانية وينبه للتجاوزات ويدون كل معاملة في سجل القرارات."
                ) : (
                  "Every payment release requires approval from both the client and the Technical Manager. The AI tracks the budget, flags overruns, and logs every transaction in the Decision Ledger — transparent to all parties."
                )}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.25} className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-5 py-2 text-sm text-muted-foreground">
              <FileClock className="size-4 text-primary" />
              {isAr ? (
                <>
                  كل قرار مسجل في <strong className="text-foreground">سجل القرارات (Decision Ledger)</strong> — سجل دائم موثوق يمكن للفريق والمراجعين الاطلاع عليه.
                </>
              ) : (
                <>
                  Every decision is logged in the <strong className="text-foreground">Decision Ledger</strong> — a permanent, tamper-evident record your team and auditors can review.
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Comparison */}
      <section id="comparison" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>{isAr ? "لماذا DevPilot" : "Why DevPilot"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "اللوحة تنظم العمل. DevPilot ينفذه." : "A board organizes work. DevPilot does it."}
            </h2>
          </Reveal>

          <Reveal delay={0.05} className="mt-10 overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border bg-card/60 text-left">
                  <th className="px-5 py-3.5 font-medium text-muted-foreground">{isAr ? "القدرة" : "Capability"}</th>
                  <th className="px-5 py-3.5 font-medium text-muted-foreground text-center">ClickUp / Jira</th>
                  <th className="px-5 py-3.5 font-medium text-primary text-center">DevPilot</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.capability} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-card/30")}>
                    <td className="px-5 py-3.5">{row.capability}</td>
                    <td className="px-5 py-3.5 text-center">
                      {row.clickup ? <Check className="mx-auto size-4 text-success" /> : <X className="mx-auto size-4 text-muted-foreground/50" />}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {row.devpilot ? <Check className="mx-auto size-4 text-primary" /> : <X className="mx-auto size-4 text-muted-foreground/50" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AI Features grid */}
      <section id="features" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>{isAr ? "تحت المحرك" : "Under the hood"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "خمس عشرة ميزة ذكاء اصطناعي، مدير واحد مستمر." : "Fifteen AI capabilities, one continuous manager."}
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.label} delay={(i % 3) * 0.04}>
                  <div className="group h-full rounded-xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-primary/[0.04]">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" strokeWidth={1.75} />
                      </div>
                      <h4 className="text-sm font-semibold">{feature.label}</h4>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70 italic">{feature.example}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/80 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="text-center">
            <SectionEyebrow>{isAr ? "الأسعار" : "Pricing"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {isAr ? "مصممة للنتائج الواقعية، ليس لمجرد الميزات." : "Built for outcomes, not feature lists."}
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              {isAr ? (
                "قلل مخاطر المشروع. وفر الوقت. امنع الفشل. حافظ على شريك تقني ومسؤول في المسار."
              ) : (
                "Reduce project risk. Save time. Prevent failure. Keep an accountable engineering partner in the loop."
              )}
            </p>
          </Reveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.05}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-xl border p-5 transition-transform hover:-translate-y-1",
                    plan.highlighted ? "border-primary/50 bg-primary/[0.05]" : "border-border bg-card/50"
                  )}
                >
                  {plan.highlighted && (
                    <Badge className="absolute -top-3 left-6">{isAr ? "الأكثر شعبية" : "Most popular"}</Badge>
                  )}
                  <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{plan.tagline}</p>
                  <p className="mt-3 font-display text-3xl font-semibold">
                    {plan.price}
                    {plan.priceNote && <span className="text-sm font-normal text-muted-foreground">{plan.priceNote}</span>}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {plan.features.map((f) => (
                      <span key={f} className="inline-block rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                        {f}
                      </span>
                    ))}
                  </div>
                  {plan.note && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="flex items-start gap-1.5 text-[11px] text-primary">
                        <Check className="mt-0.5 size-3 shrink-0" />
                        <span>{plan.note}</span>
                      </p>
                    </div>
                  )}
                  {plan.checks.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-border pt-3">
                      {plan.checks.map((c) => (
                        <p key={c} className="flex items-start gap-1.5 text-[11px] text-primary">
                          <Check className="mt-0.5 size-3 shrink-0" />
                          <span>{c}</span>
                        </p>
                      ))}
                    </div>
                  )}
                  <Button
                    className="mt-4"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={onEnter}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why DevPilot isn't just another AI tool */}
      <section id="why-devpilot" className="border-t border-border/80 py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Reveal>
            <SectionEyebrow>{isAr ? "مبني بشكل مختلف" : "Built differently"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {isAr ? "لماذا DevPilot ليس مجرد أداة ذكاء اصطناعي أخرى؟" : "Why DevPilot isn't just another AI tool"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAr ? (
                "معظم أدوات البرمجة بالذكاء الاصطناعي تكتفي بإعطائك مجرد اقتراحات. DevPilot يقدم لك قرارات مدعومة بمسارات عمل هندسية وفحص للمخاطر وإشراف بشري."
              ) : (
                "Most AI coding tools leave you with a suggestion. DevPilot gives you decisions backed by engineering workflows, risk checks, and human oversight."
              )}
            </p>
          </Reveal>

          <Reveal delay={0.05} className="mt-6 overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-card/60 text-left">
                    <th className="px-5 py-3 font-medium text-muted-foreground">{isAr ? "الذكاء الاصطناعي التقليدي" : "Traditional AI"}</th>
                    <th className="px-5 py-3 font-medium text-primary">DevPilot</th>
                  </tr>
                </thead>
                <tbody>
                  {WHY_DEVPILOT_ROWS.map((row, i) => (
                    <tr key={row.traditional} className={cn("border-b border-border last:border-0", i % 2 === 1 && "bg-card/30")}>
                      <td className="px-5 py-3 text-muted-foreground">{row.traditional}</td>
                      <td className="px-5 py-3 font-medium">{row.devpilot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Human Oversight */}
      <section id="human-oversight" className="border-t border-border/80 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <SectionEyebrow>{isAr ? "الإشراف البشري" : "Human Oversight"}</SectionEyebrow>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "الذكاء الاصطناعي يقترح. الخبراء يعتمدون." : "AI proposes. Experts validate."}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              {isAr ? (
                "كل توصية من الذكاء الاصطناعي تمر عبر محرك تقييم المخاطر. القرارات ذات المخاطر المنخفضة تتقدم تلقائياً، بينما القرارات عالية المخاطر توجّه للمدير التقني مسبقاً."
              ) : (
                "Every AI recommendation passes through a risk engine. Low-risk decisions move forward automatically. High-risk decisions are routed to a Technical Manager before anything gets built."
              )}
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-12 flex flex-col items-center gap-3">
              <FlowNode>{isAr ? "الفكرة" : "Idea"}</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode>{isAr ? "تحليل الذكاء الاصطناعي" : "AI Analysis"}</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode>{isAr ? "توصية الذكاء الاصطناعي" : "AI Recommendation"}</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode highlight>{isAr ? "محرك المخاطر" : "Risk Engine"}</FlowNode>
              <div className="my-1 h-6 w-px bg-border" />
              <div className="grid w-full max-w-xl grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex flex-col items-center gap-3">
                  <FlowNode>{isAr ? "مخاطر منخفضة" : "Low Risk"}</FlowNode>
                  <ArrowDown className="size-5 text-muted-foreground/60" />
                  <FlowNode>{isAr ? "المتابعة مباشرة" : "Continue"}</FlowNode>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <FlowNode>{isAr ? "مخاطر عالية" : "High Risk"}</FlowNode>
                  <ArrowDown className="size-5 text-muted-foreground/60" />
                  <FlowNode>{isAr ? "مراجعة المدير التقني" : "Technical Manager Review"}</FlowNode>
                </div>
              </div>
              <div className="my-1 h-6 w-px bg-border" />
              <FlowNode highlight>{isAr ? "سجل القرارات" : "Decision Ledger"}</FlowNode>
              <ArrowDown className="size-5 text-muted-foreground/60" />
              <FlowNode>{isAr ? "التطوير والتنفيذ" : "Development"}</FlowNode>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA + footer */}
      <section className="border-t border-border/80 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              {isAr ? "مشروعك القادم يستحق إشرافاً حقيقياً." : "Your next project deserves real oversight."}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {isAr ? "حتى لو بدأ بالذكاء الاصطناعي، الخبير البشري يعتمد كل ما هو هام." : "Even if it starts with AI, a human expert signs off on what matters."}
            </p>
            <div className="mt-7">
              <Button size="lg" onClick={onEnter}>
                {isAr ? "افتح لوحة التحكم" : "Launch the dashboard"}
                <ArrowRight className={`size-4 ${isAr ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-border/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
          <span>
            {isAr ? (
              `© ${new Date().getFullYear()} DevPilot. جميع التقديرات مُنشأة بالذكاء الاصطناعي وتخضع لمراجعة بشريّة قبل اعتمادها النهائي.`
            ) : (
              `© ${new Date().getFullYear()} DevPilot. All estimates are AI-generated and reviewed by a human before they're final.`
            )}
          </span>
          <span className="font-mono">{isAr ? "الذكاء الاصطناعي يقترح · البشر يعتمدون" : "AI proposes · humans approve"}</span>
        </div>
      </footer>
    </div>
  );
}
