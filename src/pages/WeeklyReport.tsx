import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { WeeklyReport } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Plus, Printer } from "lucide-react";

export default function WeeklyReportPage() {
  const { tasks, weeklyReports, addWeeklyReport } = useApp();
  const [achievements, setAchievements] = useState("");
  const [challenges, setChallenges] = useState("");
  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [ceoNotes, setCeoNotes] = useState("");

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekStart = startOfWeek.toISOString().split("T")[0];
  const weekEnd = endOfWeek.toISOString().split("T")[0];

  const completedThisWeek = useMemo(() => tasks.filter((t) => t.status === "Completed" && t.completionDate && t.completionDate >= weekStart && t.completionDate <= weekEnd), [tasks, weekStart, weekEnd]);
  const pendingTasks = useMemo(() => tasks.filter((t) => t.status !== "Completed" && t.dueDate <= weekEnd), [tasks, weekEnd]);
  const overdueTasks = useMemo(() => tasks.filter((t) => t.status !== "Completed" && t.dueDate < today.toISOString().split("T")[0]), [tasks]);
  const newThisWeek = useMemo(() => tasks.filter((t) => t.createdAt >= weekStart), [tasks, weekStart]);

  const weekNum = Math.ceil(((today.getTime() - new Date("2026-03-01").getTime()) / (1000 * 60 * 60 * 24)) / 7);

  const generateReport = () => {
    const report: WeeklyReport = {
      id: crypto.randomUUID(), weekNumber: weekNum, startDate: weekStart, endDate: weekEnd,
      tasksCompleted: completedThisWeek.map((t) => t.taskId),
      tasksPending: pendingTasks.map((t) => t.taskId),
      tasksOverdue: overdueTasks.map((t) => t.taskId),
      newTasksAdded: newThisWeek.map((t) => t.taskId),
      achievements, challenges, nextWeekPlan, ceoNotes,
      createdAt: new Date().toISOString(),
    };
    addWeeklyReport(report);
    toast.success("Report generated and saved!");
    setAchievements(""); setChallenges(""); setNextWeekPlan(""); setCeoNotes("");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Weekly Report</h1><p className="text-sm text-muted-foreground">Week {weekNum} — {weekStart} to {weekEnd}</p></div>
        <Button onClick={() => window.print()} variant="outline" size="sm"><Printer className="h-4 w-4 mr-1" />Print</Button>
      </div>

      {/* Auto-populated */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">✅ Completed This Week ({completedThisWeek.length})</CardTitle></CardHeader>
          <CardContent>{completedThisWeek.length > 0 ? completedThisWeek.map((t) => <p key={t.id} className="text-xs py-1">{t.taskId} — {t.title}</p>) : <p className="text-xs text-muted-foreground">None</p>}</CardContent></Card>
        <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">⏳ Pending/Overdue ({pendingTasks.length})</CardTitle></CardHeader>
          <CardContent>{pendingTasks.length > 0 ? pendingTasks.map((t) => <p key={t.id} className="text-xs py-1">{t.taskId} — {t.title} {overdueTasks.includes(t) && <Badge variant="destructive" className="text-[10px] ml-1">Overdue</Badge>}</p>) : <p className="text-xs text-muted-foreground">None</p>}</CardContent></Card>
      </div>

      {/* Manual sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">Key Achievements</CardTitle></CardHeader>
          <CardContent><Textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} placeholder="What went well..." rows={3} /></CardContent></Card>
        <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">Challenges Faced</CardTitle></CardHeader>
          <CardContent><Textarea value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="Any blockers or issues..." rows={3} /></CardContent></Card>
        <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">Next Week's Plan</CardTitle></CardHeader>
          <CardContent><Textarea value={nextWeekPlan} onChange={(e) => setNextWeekPlan(e.target.value)} placeholder="Key focus areas..." rows={3} /></CardContent></Card>
        <Card className="glass-card"><CardHeader className="pb-2"><CardTitle className="text-sm">CEO Notes</CardTitle></CardHeader>
          <CardContent><Textarea value={ceoNotes} onChange={(e) => setCeoNotes(e.target.value)} placeholder="Highlights for CEO..." rows={3} /></CardContent></Card>
      </div>

      <Button onClick={generateReport} className="w-full"><FileText className="h-4 w-4 mr-2" />Generate & Save Report</Button>

      {/* Past reports */}
      {weeklyReports.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-sm">Past Reports</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {weeklyReports.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                <span>Week {r.weekNumber} ({r.startDate} to {r.endDate})</span>
                <Badge variant="outline">{r.tasksCompleted.length} completed</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
