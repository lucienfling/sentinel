import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetTodaysBriefing, useCompletePriority, useDismissRecommendation } from "@workspace/api-client-react";
import { format } from "date-fns";
import { CheckCircle2, Circle, AlertTriangle, Info, ShieldAlert, Target, Mail, Users, FileText, Check, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetTodaysBriefingQueryKey } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SYNC_STEPS = [
  "Establishing secure connection...",
  "Synchronizing Exchange server...",
  "Pulling Calendar events...",
  "Aggregating project repositories...",
  "Synthesizing threat intelligence...",
  "Compiling executive summary...",
];

export default function Dashboard() {
  const [syncStep, setSyncStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  const { data: briefing, isLoading } = useGetTodaysBriefing();
  const completePriority = useCompletePriority();
  const dismissRecommendation = useDismissRecommendation();

  useEffect(() => {
    if (!isInitializing) return;
    
    const interval = setInterval(() => {
      setSyncStep((prev) => {
        if (prev >= SYNC_STEPS.length - 1) {
          clearInterval(interval);
          setTimeout(() => setIsInitializing(false), 800);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(interval);
  }, [isInitializing]);

  const handleCompletePriority = (id: number) => {
    completePriority.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodaysBriefingQueryKey() });
      }
    });
  };

  const handleDismissRecommendation = (id: number) => {
    dismissRecommendation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodaysBriefingQueryKey() });
      }
    });
  };

  if (isInitializing || isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0a0a0b]">
        <div className="w-[400px] max-w-full font-mono text-sm">
          <div className="mb-4 text-primary font-bold">SENTINEL_EIS v2.4.1</div>
          <div className="space-y-2 text-muted-foreground">
            {SYNC_STEPS.map((step, idx) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: idx <= syncStep ? 1 : 0, x: idx <= syncStep ? 0 : -10 }}
                className="flex items-center gap-2"
              >
                <span className="text-primary">{idx < syncStep ? "[OK]" : idx === syncStep ? "[..]" : "[  ]"}</span>
                <span className={idx === syncStep ? "text-foreground" : ""}>{step}</span>
              </motion.div>
            ))}
          </div>
          {syncStep >= SYNC_STEPS.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-primary border-t border-primary/20 pt-4"
            >
              Analysis complete. Preparing briefing...
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No briefing generated for today yet.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <header className="mb-12 border-b border-border pb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mb-2">
                {format(new Date(briefing.date), "EEEE, MMMM do, yyyy")}
              </p>
              <h1 className="text-4xl font-light text-foreground">{briefing.greeting}</h1>
              <p className="mt-4 text-xl font-medium text-foreground/80 border-l-2 border-primary pl-4 py-1">
                {briefing.headline}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-light text-primary">{briefing.executiveSummary.productivityScore}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-medium mt-1">Prod Score</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-[#16161A]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Target className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-medium">{briefing.executiveSummary.focusScore}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Focus Ready</div>
            </CardContent>
          </Card>
          <Card className="bg-[#16161A]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Mail className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-medium">{briefing.executiveSummary.pendingEmails}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Pending Emails</div>
            </CardContent>
          </Card>
          <Card className="bg-[#16161A]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Users className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-medium">{briefing.executiveSummary.meetingsToday}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Meetings</div>
            </CardContent>
          </Card>
          <Card className="bg-[#16161A]">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <FileText className="h-5 w-5 text-primary mb-2" />
              <div className="text-2xl font-medium">{briefing.executiveSummary.activeProjects}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Projects</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Priorities */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Strategic Priorities</h2>
            <div className="space-y-3">
              {briefing.priorities.map((priority) => (
                <div 
                  key={priority.id} 
                  className={cn(
                    "flex gap-4 p-4 rounded-lg border bg-[#16161A] transition-all",
                    priority.isCompleted ? "opacity-50 grayscale" : "border-border hover:border-primary/50"
                  )}
                >
                  <button 
                    onClick={() => handleCompletePriority(priority.id)}
                    disabled={priority.isCompleted || completePriority.isPending}
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:pointer-events-none"
                  >
                    {priority.isCompleted ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5" />}
                  </button>
                  <div className="flex-1">
                    <h3 className={cn("text-base font-medium", priority.isCompleted && "line-through")}>{priority.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{priority.reasoning}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-mono">
                      <span>EST: {priority.estimatedMinutes}m</span>
                      {priority.deadline && <span>DUE: {format(new Date(priority.deadline), "HH:mm")}</span>}
                      <span className="text-primary">{priority.confidenceLevel}% CONF</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Intelligence & Recommendations */}
          <div className="space-y-8">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Intelligence Feed</h2>
              <div className="space-y-3">
                {briefing.insights.map((insight) => (
                  <div key={insight.id} className="p-4 rounded-lg border border-border bg-[#16161A] flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      {insight.severity === 'critical' ? <ShieldAlert className="h-4 w-4 text-destructive" /> : 
                       insight.severity === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> :
                       <Info className="h-4 w-4 text-primary" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Actionable Recommendations</h2>
              <div className="space-y-3">
                {briefing.recommendations.filter(r => !r.isDismissed).map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border border-primary/20 bg-primary/5 group relative">
                    <button 
                      onClick={() => handleDismissRecommendation(rec.id)}
                      className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <h4 className="text-sm font-medium text-primary mb-1">{rec.title}</h4>
                    <p className="text-xs text-muted-foreground/80">{rec.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}