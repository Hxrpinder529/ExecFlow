import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isOverdue, getDaysRemaining } from "@/lib/helpers";
import { CheckCircle, Clock, AlertTriangle, ListTodo } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";

const CHART_COLORS = [
  "hsl(220,47%,20%)",
  "hsl(38,92%,55%)",
  "hsl(142,71%,45%)",
  "hsl(0,84%,60%)",
  "hsl(210,100%,52%)"
];

export default function Dashboard() {
  const { tasks, milestones } = useApp();
  const today = new Date().toISOString().split("T")[0];
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === "Completed").length;
    const inProgress = tasks.filter(t => t.status === "In Progress").length;
    const overdue = tasks.filter(isOverdue).length;

    return { total, completed, inProgress, overdue };

  }, [tasks]);

  const statusData = useMemo(() => {

    const map: Record<string, number> = {};

    tasks.forEach(t => {
      map[t.status] = (map[t.status] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const order = ["Critical", "High", "Medium", "Low"];
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      map[t.priority] = (map[t.priority] || 0) + 1;
    });

    return order.map(name => ({
      name,
      value: map[name] || 0
    }));
  }, [tasks]);

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    tasks.forEach(t => {
      map[t.category] = (map[t.category] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value
    }));

  }, [tasks]);
  const overallCompletion = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(
      tasks.reduce((sum, t) => sum + t.percentComplete, 0) / tasks.length
    );

  }, [tasks]);
  const overdueTasks = useMemo(() => tasks.filter(isOverdue), [tasks]);
  const dueTodayTasks = useMemo(() =>
    tasks.filter(t => t.status !== "Completed" && t.dueDate === today),
    [tasks, today]
  );

  const kpiCards = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-primary" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-success" },
    { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-info" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-destructive" },
  ];

  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Task Overview — Real-time Status
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(kpi => (
          <Card key={kpi.label} className="glass-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >

                  {statusData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Tasks by Priority
            </CardTitle>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Overall Task Completion
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center h-[200px]">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(220,15%,88%)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(38,92%,55%)"
                  strokeWidth="8"
                  strokeDasharray={`${overallCompletion * 2.51} 251`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{overallCompletion}%</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Task Progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Alerts
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 max-h-[220px] overflow-auto">
          {overdueTasks.map(t => (
            <div key={t.id} className="text-xs p-2 rounded bg-destructive/5 border border-destructive/10">
              <span className="font-medium">{t.taskId}</span> — {t.title}
              <Badge className="ml-2 text-[10px] bg-destructive/10 text-destructive">
                {Math.abs(getDaysRemaining(t.dueDate))}d overdue
              </Badge>
            </div>
          ))}
          {dueTodayTasks.map(t => (
            <div key={t.id} className="text-xs p-2 rounded bg-warning/5 border border-warning/10">
              <span className="font-medium">{t.taskId}</span> — {t.title}
            </div>
          ))}

          {!overdueTasks.length && !dueTodayTasks.length && (
            <p className="text-xs text-muted-foreground text-center py-6">
              ✅ No critical alerts — All tasks on track!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Project Timeline Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {milestones?.map(m => {
              const isCurrent = m.month === currentMonth;
              return (

                <div
                  key={m.month}
                  className={`flex-1 min-w-[80px] p-2 rounded-lg text-center text-xs border
                  ${isCurrent
                    ? "bg-accent/20 border-accent text-accent-foreground font-semibold"
                    : "bg-muted/50 border-border text-muted-foreground"
                  }`}
                >
                  <p className="font-medium">Month {m.month}</p>
                  <p className="text-[10px]">{m.phase}</p>
                  {isCurrent && (
                    <Badge className="mt-1 text-[10px] bg-accent text-accent-foreground">
                      Current
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}