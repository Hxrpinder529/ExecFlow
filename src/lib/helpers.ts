import { Task } from "@/types";

export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function getDaysRemaining(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(task: Task): boolean {
  return task.status !== "Completed" && getDaysRemaining(task.dueDate) < 0;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "Critical": return "text-destructive";
    case "High": return "text-warning";
    case "Medium": return "text-accent";
    case "Low": return "text-success";
    default: return "";
  }
}

export function getPriorityBg(priority: string): string {
  switch (priority) {
    case "Critical": return "bg-destructive/10 text-destructive border-destructive/20";
    case "High": return "bg-warning/10 text-warning border-warning/20";
    case "Medium": return "bg-accent/10 text-accent-foreground border-accent/20";
    case "Low": return "bg-success/10 text-success border-success/20";
    default: return "";
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case "Completed": return "bg-success/10 text-success border-success/20";
    case "In Progress": return "bg-info/10 text-info border-info/20";
    case "Under Review": return "bg-accent/10 text-accent-foreground border-accent/20";
    case "To Do": return "bg-muted text-muted-foreground border-border";
    case "On Hold": return "bg-destructive/10 text-destructive border-destructive/20";
    default: return "";
  }
}

export function exportTasksToCSV(tasks: Task[]) {
  const headers = ["Task ID", "Title", "Status", "Priority", "Category", "Assigned To", "Due Date", "% Complete"];
  const rows = tasks.map((t) => [t.taskId, t.title, t.status, t.priority, t.category, t.assignedTo, formatDateDDMMYYYY(t.dueDate), t.percentComplete]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tasks_export_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
