import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ProjectTimeline() {
  const { milestones, tasks } = useApp();
  const overallProgress =
    milestones.length > 0
      ? Math.round(
          milestones.reduce((s, m) => s + (m.completionPercent || 0), 0) /
            milestones.length
        )
      : 0;

  const currentMonth = new Date().getMonth() + 1;
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Project Timeline & Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Track milestones and deliverables across all active projects
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">
              Overall Project Progress
            </span>
            <span className="text-sm font-bold">{overallProgress}%</span>
          </div>

          <Progress value={overallProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        {milestones?.map((milestone) => {
          const isCurrent = milestone.month === currentMonth;
          const milestoneTasks = tasks.filter((t) =>
            milestone.keyTasks?.includes(t.taskId)
          );

          return (
            <Card
              key={milestone.month}
              className={`glass-card transition-all ${
                isCurrent ? "ring-2 ring-accent" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold
                      ${
                        isCurrent
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      M{milestone.month}
                    </div>

                    <div>
                      <CardTitle className="text-base">
                        {milestone.name} — {milestone.phase}
                      </CardTitle>

                      <p className="text-xs text-muted-foreground">
                        {milestone.goals}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCurrent && (
                      <Badge className="bg-accent text-accent-foreground">
                        Current
                      </Badge>
                    )}

                    <span className="text-sm font-bold">
                      {milestone.completionPercent || 0}%
                    </span>
                  </div>
                </div>

              </CardHeader>
              <CardContent>
                <Progress
                  value={milestone.completionPercent || 0}
                  className="h-2 mb-3"
                />

                {milestoneTasks.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Key Tasks:
                    </p>

                    {milestoneTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/50"
                      >
                        <span>
                          {t.taskId} — {t.title}
                        </span>

                        <Badge variant="outline" className="text-[10px]">
                          {t.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {milestoneTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No tasks assigned yet
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}