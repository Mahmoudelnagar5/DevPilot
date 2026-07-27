import { useState } from "react";
import { useLanguage } from "../LanguageContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "./ui/dialog";
import {
  ShieldCheck, Calendar, Clock, DollarSign, Sparkles, CheckCircle2, UserCheck, Zap, AlertCircle, FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "./ui/utils";

interface BookTQAMeetingDialogProps {
  projectName?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function BookTQAMeetingDialog({ projectName, trigger, onSuccess }: BookTQAMeetingDialogProps) {
  const { t, lang } = useLanguage();
  const isAr = lang === "ar";
  const [open, setOpen] = useState(false);

  // State
  const [qaLevel, setQaLevel] = useState<"mid" | "senior" | "lead">("senior");
  const [urgency, setUrgency] = useState<"standard" | "express" | "vip">("standard");
  const [preferredDate, setPreferredDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]
  );
  const [preferredTime, setPreferredTime] = useState<string>("14:00");
  const [focusNotes, setFocusNotes] = useState<string>("");

  // Pricing configuration
  const LEVEL_RATES = {
    mid: 49,
    senior: 89,
    lead: 149,
  };

  const URGENCY_FEES = {
    standard: 0,
    express: 35,
    vip: 75,
  };

  const totalCost = LEVEL_RATES[qaLevel] + URGENCY_FEES[urgency];

  const handleBooking = () => {
    toast.success(t("tqa.bookingSuccess"), {
      description: `${qaLevel.toUpperCase()} QA Review scheduled for ${preferredDate} at ${preferredTime} ($${totalCost}).`,
      icon: "🛡️",
      duration: 5000,
    });
    setOpen(false);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md">
            <ShieldCheck className="size-4 mr-2" />
            {t("tqa.bookMeetingBtn")}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>{isAr ? "ضمان الجودة والاعتماد التقني" : "Technical Quality Assurance (TQA)"}</span>
          </div>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {t("tqa.modalTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("tqa.modalDesc")} {projectName && <span className="font-semibold text-foreground">({projectName})</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Step 1: Select QA Level */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
              1. {t("tqa.selectQaLevel")}
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: "mid" as const,
                  title: t("tqa.qaLevelMid"),
                  desc: t("tqa.qaLevelMidDesc"),
                  price: 49,
                  icon: UserCheck,
                },
                {
                  id: "senior" as const,
                  title: t("tqa.qaLevelSenior"),
                  desc: t("tqa.qaLevelSeniorDesc"),
                  price: 89,
                  popular: true,
                  icon: ShieldCheck,
                },
                {
                  id: "lead" as const,
                  title: t("tqa.qaLevelLead"),
                  desc: t("tqa.qaLevelLeadDesc"),
                  price: 149,
                  icon: Sparkles,
                },
              ].map((lvl) => {
                const Icon = lvl.icon;
                const selected = qaLevel === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setQaLevel(lvl.id)}
                    className={cn(
                      "relative flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all hover:border-emerald-500/50",
                      selected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                        : "border-border bg-card/60"
                    )}
                  >
                    {lvl.popular && (
                      <Badge className="absolute -top-2.5 right-3 bg-emerald-600 text-white text-[10px] px-2 py-0">
                        {isAr ? "الأكثر طلباً" : "RECOMMENDED"}
                      </Badge>
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={cn("size-5", selected ? "text-emerald-400" : "text-muted-foreground")} />
                        <span className="font-mono text-sm font-bold text-emerald-400">${lvl.price}</span>
                      </div>
                      <h4 className="font-semibold text-sm leading-snug">{lvl.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{lvl.desc}</p>
                    </div>
                    {selected && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3.5" />
                        <span>{isAr ? "محدد" : "Selected"}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Timing & Urgency */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-2 font-semibold">
              2. {t("tqa.selectUrgency")}
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  id: "standard" as const,
                  title: t("tqa.urgencyStandard"),
                  desc: t("tqa.urgencyStandardNote"),
                  fee: 0,
                  icon: Clock,
                },
                {
                  id: "express" as const,
                  title: t("tqa.urgencyExpress"),
                  desc: t("tqa.urgencyExpressNote"),
                  fee: 35,
                  icon: Zap,
                },
                {
                  id: "vip" as const,
                  title: t("tqa.urgencyVip"),
                  desc: t("tqa.urgencyVipNote"),
                  fee: 75,
                  icon: AlertCircle,
                },
              ].map((urg) => {
                const Icon = urg.icon;
                const selected = urgency === urg.id;
                return (
                  <div
                    key={urg.id}
                    onClick={() => setUrgency(urg.id)}
                    className={cn(
                      "flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all hover:border-emerald-500/50",
                      selected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                        : "border-border bg-card/60"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={cn("size-4", selected ? "text-emerald-400" : "text-muted-foreground")} />
                        <span className="font-mono text-xs font-semibold text-muted-foreground">
                          {urg.fee === 0 ? (isAr ? "مضمن" : "Included") : `+$${urg.fee}`}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm leading-snug">{urg.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{urg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Date & Time Selection */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                3. {t("tqa.preferredDate")}
              </label>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="bg-card border-border"
              />
            </div>

            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
                {t("tqa.preferredTime")}
              </label>
              <Input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="bg-card border-border"
              />
            </div>
          </div>

          {/* Step 4: Focus Areas */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground block mb-1.5 font-semibold">
              4. {t("tqa.focusAreas")}
            </label>
            <Textarea
              rows={3}
              value={focusNotes}
              onChange={(e) => setFocusNotes(e.target.value)}
              placeholder={t("tqa.focusAreasPlaceholder")}
              className="bg-card border-border text-sm"
            />
          </div>

          {/* Price Breakdown Summary */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground font-mono">
                Level Rate (${LEVEL_RATES[qaLevel]}) + Timing Fee (${URGENCY_FEES[urgency]})
              </div>
              <div className="font-display font-semibold text-foreground text-sm">
                {t("tqa.totalCost")}
              </div>
            </div>
            <div className="text-right">
              <span className="font-display text-3xl font-extrabold text-emerald-400">
                ${totalCost}
              </span>
              <span className="text-xs text-muted-foreground block">
                {isAr ? "رسوم الاستشارة" : "one-time fee"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 border-t border-border pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("client.cancel")}
          </Button>
          <Button
            onClick={handleBooking}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 font-semibold"
          >
            <FileCheck className="size-4 mr-2" />
            {t("tqa.confirmBooking")} (${totalCost})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
