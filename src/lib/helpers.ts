import { Task } from "@/types";
import { Task, WeeklyReport, Project, FollowUp } from "@/types";
import * as XLSX from 'xlsx';

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

export function exportWeeklyReportToExcel(
  weeklyReport: WeeklyReport,
  tasks: Task[],
  followUps: FollowUp[],
  projects: Project[]
) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // 1. Report Summary Sheet
  const summaryData = [
    ['Weekly Report Summary'],
    ['Week Number', weeklyReport.weekNumber],
    ['Start Date', weeklyReport.startDate],
    ['End Date', weeklyReport.endDate],
    ['Generated On', new Date().toLocaleString()],
    [],
    ['Metrics', 'Count'],
    ['Tasks Completed', weeklyReport.tasksCompleted.length],
    ['Tasks Pending', weeklyReport.tasksPending.length],
    ['Tasks Overdue', weeklyReport.tasksOverdue.length],
    ['New Tasks Added', weeklyReport.newTasksAdded.length],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // 2. Tasks Completed Sheet
  const completedTasks = tasks.filter(t => weeklyReport.tasksCompleted.includes(t.taskId));
  const completedData = [
    ['Task ID', 'Title', 'Category', 'Priority', 'Assigned To', 'Completed Date', 'Remarks'],
    ...completedTasks.map(t => [
      t.taskId,
      t.title,
      t.category,
      t.priority,
      t.assignedTo,
      t.completionDate || '-',
      t.remarks || '-'
    ])
  ];
  
  const completedSheet = XLSX.utils.aoa_to_sheet(completedData);
  XLSX.utils.book_append_sheet(wb, completedSheet, 'Completed Tasks');

  // 3. Pending Tasks Sheet
  const pendingTasks = tasks.filter(t => weeklyReport.tasksPending.includes(t.taskId));
  const pendingData = [
    ['Task ID', 'Title', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Progress %', 'Status'],
    ...pendingTasks.map(t => [
      t.taskId,
      t.title,
      t.category,
      t.priority,
      t.assignedTo,
      t.dueDate,
      t.percentComplete,
      t.status
    ])
  ];
  
  const pendingSheet = XLSX.utils.aoa_to_sheet(pendingData);
  XLSX.utils.book_append_sheet(wb, pendingSheet, 'Pending Tasks');

  // 4. Overdue Tasks Sheet
  const overdueTasks = tasks.filter(t => weeklyReport.tasksOverdue.includes(t.taskId));
  const overdueData = [
    ['Task ID', 'Title', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Days Overdue'],
    ...overdueTasks.map(t => {
      const daysOverdue = Math.ceil((new Date().getTime() - new Date(t.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return [
        t.taskId,
        t.title,
        t.category,
        t.priority,
        t.assignedTo,
        t.dueDate,
        daysOverdue
      ];
    })
  ];
  
  const overdueSheet = XLSX.utils.aoa_to_sheet(overdueData);
  XLSX.utils.book_append_sheet(wb, overdueSheet, 'Overdue Tasks');

  // 5. Follow-ups Sheet
  const relevantFollowUps = followUps.filter(f => 
    tasks.some(t => t.taskId === f.taskId && 
      (weeklyReport.tasksCompleted.includes(t.taskId) ||
       weeklyReport.tasksPending.includes(t.taskId) ||
       weeklyReport.tasksOverdue.includes(t.taskId))
    )
  );
  
  const followUpData = [
    ['Task ID', 'Follow-up Date', 'Type', 'Stakeholder', 'Action Item', 'Status', 'Next Follow-up'],
    ...relevantFollowUps.map(f => [
      f.taskId,
      f.followUpDate,
      f.type,
      f.stakeholder,
      f.actionItem,
      f.status,
      f.nextFollowUpDate || '-'
    ])
  ];
  
  const followUpSheet = XLSX.utils.aoa_to_sheet(followUpData);
  XLSX.utils.book_append_sheet(wb, followUpSheet, 'Follow-ups');

  // 6. Narrative Section
  const narrativeData = [
    ['Key Achievements'],
    [weeklyReport.achievements || 'No achievements recorded'],
    [],
    ['Challenges Faced'],
    [weeklyReport.challenges || 'No challenges recorded'],
    [],
    ['Next Week Plan'],
    [weeklyReport.nextWeekPlan || 'No plan recorded'],
    [],
    ['CEO Notes'],
    [weeklyReport.ceoNotes || 'No notes recorded']
  ];
  
  const narrativeSheet = XLSX.utils.aoa_to_sheet(narrativeData);
  XLSX.utils.book_append_sheet(wb, narrativeSheet, 'Narrative');

  // Save the file
  const fileName = `weekly_report_week_${weeklyReport.weekNumber}_${weeklyReport.startDate}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export all tasks to Excel with multiple sheets
 */
export function exportAllTasksToExcel(tasks: Task[], followUps: FollowUp[]) {
  const wb = XLSX.utils.book_new();

  // Summary by status
  const statusSummary = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summaryData = [
    ['Task Register Export', new Date().toLocaleString()],
    [],
    ['Status Summary'],
    ...Object.entries(statusSummary).map(([status, count]) => [status, count]),
    [],
    ['Total Tasks', tasks.length]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // All tasks sheet
  const tasksData = [
    ['Task ID', 'Title', 'Description', 'Category', 'Priority', 'Status', 'Assigned By', 'Assigned To', 'Requested By', 'Start Date', 'Due Date', 'Completion Date', 'Progress %', 'Remarks', 'Created At'],
    ...tasks.map(t => [
      t.taskId,
      t.title,
      t.description,
      t.category,
      t.priority,
      t.status,
      t.assignedBy,
      t.assignedTo,
      t.requestedBy || '-',
      t.startDate,
      t.dueDate,
      t.completionDate || '-',
      t.percentComplete,
      t.remarks || '-',
      t.createdAt
    ])
  ];
  
  const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
  XLSX.utils.book_append_sheet(wb, tasksSheet, 'All Tasks');

  // Follow-ups sheet
  if (followUps.length > 0) {
    const followUpData = [
      ['Task ID', 'Follow-up Date', 'Type', 'Stakeholder', 'Action Item', 'Outcome', 'Status', 'Next Follow-up'],
      ...followUps.map(f => [
        f.taskId,
        f.followUpDate,
        f.type,
        f.stakeholder,
        f.actionItem,
        f.outcome || '-',
        f.status,
        f.nextFollowUpDate || '-'
      ])
    ];
    
    const followUpSheet = XLSX.utils.aoa_to_sheet(followUpData);
    XLSX.utils.book_append_sheet(wb, followUpSheet, 'Follow-ups');
  }

  const fileName = `all_tasks_export_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Export project progress to Excel
 */
export function exportProjectToExcel(project: Project, tasks: Task[]) {
  const wb = XLSX.utils.book_new();

  // Project summary
  const summaryData = [
    ['Project Summary'],
    ['Project Name', project.name],
    ['Department', project.department],
    ['Description', project.description],
    ['Start Date', project.startDate],
    ['End Date', project.endDate],
    ['Status', project.status],
    ['Overall Progress', `${project.progress}%`],
    ['Last Updated', new Date(project.updatedAt).toLocaleString()],
    [],
    ['Plan Items Summary'],
    ['Total Phases', project.plan.length],
    ['Completed', project.plan.filter(p => p.status === 'Completed').length],
    ['In Progress', project.plan.filter(p => p.status === 'In Progress').length],
    ['Not Started', project.plan.filter(p => p.status === 'Not Started').length],
    ['Delayed', project.plan.filter(p => p.status === 'Delayed').length]
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // Project plan sheet
  const planData = [
    ['Phase', 'Title', 'Description', 'Planned Start', 'Planned End', 'Actual Start', 'Actual End', 'Status', 'Progress %'],
    ...project.plan.sort((a, b) => a.order - b.order).map(p => [
      `Phase ${p.order + 1}`,
      p.title,
      p.description,
      p.plannedStartDate,
      p.plannedEndDate,
      p.actualStartDate || '-',
      p.actualEndDate || '-',
      p.status,
      p.progress
    ])
  ];
  
  const planSheet = XLSX.utils.aoa_to_sheet(planData);
  XLSX.utils.book_append_sheet(wb, planSheet, 'Project Plan');

  // Related tasks
  const projectTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(project.name.toLowerCase()) ||
    t.description?.toLowerCase().includes(project.name.toLowerCase())
  );

  if (projectTasks.length > 0) {
    const tasksData = [
      ['Task ID', 'Title', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Progress %'],
      ...projectTasks.map(t => [
        t.taskId,
        t.title,
        t.status,
        t.priority,
        t.assignedTo,
        t.dueDate,
        t.percentComplete
      ])
    ];
    
    const tasksSheet = XLSX.utils.aoa_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(wb, tasksSheet, 'Related Tasks');
  }

  const fileName = `${project.name.replace(/\s+/g, '_')}_progress_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}