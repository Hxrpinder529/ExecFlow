import { Task, FollowUp, ProjectMilestone, User, defaultPermissions } from "@/types";

export const seedUsers: User[] = [
  { id: "1", email: "admin@automatax.in", name: "Admin (CEO)", role: "Admin", isActive: true, permissions: defaultPermissions.Admin },
  { id: "2", email: "vandana@automatax.in", name: "Vandana Ma'am", role: "Manager", isActive: true, permissions: defaultPermissions.Manager },
  { id: "3", email: "harpinder@automatax.in", name: "Harpinder", role: "Implementor", isActive: true, permissions: defaultPermissions.Implementor },
];

export const seedTasks: Task[] = [
  {
    id: "1", taskId: "TASK-001", title: "Complete BMP Module 1 Study", description: "Study and complete all materials for BMP Module 1 including video lectures and assignments.",
    assignedBy: "Vandana Ma'am", assignedTo: "Harpinder", category: "BMP Learning", priority: "High", status: "In Progress",
    startDate: "2026-03-01", dueDate: "2026-03-20", percentComplete: 45, remarks: "On track", createdAt: "2026-03-01T00:00:00Z", updatedAt: "2026-03-10T00:00:00Z",
  },
  {
    id: "2", taskId: "TASK-002", title: "Prepare Implementation Plan", description: "Draft the implementation plan for BMP learnings.",
    assignedBy: "CEO", assignedTo: "Harpinder", category: "Implementation", priority: "High", status: "To Do",
    startDate: "2026-03-10", dueDate: "2026-03-25", percentComplete: 0, remarks: "", createdAt: "2026-03-02T00:00:00Z", updatedAt: "2026-03-02T00:00:00Z",
  },
  {
    id: "3", taskId: "TASK-003", title: "Stakeholder Mapping Exercise", description: "Map all stakeholders involved in BMP program.",
    assignedBy: "Vandana Ma'am", assignedTo: "Harpinder", category: "Coordination", priority: "Medium", status: "Completed",
    startDate: "2026-03-01", dueDate: "2026-03-10", completionDate: "2026-03-09", percentComplete: 100, remarks: "Completed ahead of schedule", createdAt: "2026-03-01T00:00:00Z", updatedAt: "2026-03-09T00:00:00Z",
  },
  {
    id: "4", taskId: "TASK-004", title: "Weekly Report to CEO", description: "Prepare and submit weekly progress report.",
    assignedBy: "CEO", assignedTo: "Harpinder", category: "Reporting", priority: "High", status: "In Progress",
    startDate: "2026-03-10", dueDate: "2026-03-14", percentComplete: 60, remarks: "Draft ready", createdAt: "2026-03-10T00:00:00Z", updatedAt: "2026-03-13T00:00:00Z",
  },
  {
    id: "5", taskId: "TASK-005", title: "Process Documentation", description: "Document all processes for BMP implementation.",
    assignedBy: "Self", assignedTo: "Harpinder", category: "Implementation", priority: "Medium", status: "To Do",
    startDate: "2026-03-15", dueDate: "2026-03-30", percentComplete: 0, remarks: "", createdAt: "2026-03-05T00:00:00Z", updatedAt: "2026-03-05T00:00:00Z",
  },
  {
    id: "6", taskId: "TASK-006", title: "Team Briefing on BMP Goals", description: "Conduct a briefing session for the team on BMP goals and expectations.",
    assignedBy: "Vandana Ma'am", assignedTo: "Harpinder", category: "Coordination", priority: "Medium", status: "To Do",
    startDate: "2026-03-14", dueDate: "2026-03-18", percentComplete: 0, remarks: "", createdAt: "2026-03-06T00:00:00Z", updatedAt: "2026-03-06T00:00:00Z",
  },
  {
    id: "7", taskId: "TASK-007", title: "KPI Dashboard Setup", description: "Set up the KPI tracking dashboard for BMP program.",
    assignedBy: "CEO", assignedTo: "Harpinder", category: "Implementation", priority: "Critical", status: "In Progress",
    startDate: "2026-03-05", dueDate: "2026-03-15", percentComplete: 70, remarks: "Charts configured", createdAt: "2026-03-05T00:00:00Z", updatedAt: "2026-03-12T00:00:00Z",
  },
  {
    id: "8", taskId: "TASK-008", title: "Follow-up with HR on Training Schedule", description: "Contact HR to finalize training schedule for BMP.",
    assignedBy: "Vandana Ma'am", assignedTo: "Harpinder", category: "Coordination", priority: "High", status: "In Progress",
    startDate: "2026-03-08", dueDate: "2026-03-13", percentComplete: 30, remarks: "Awaiting HR response", createdAt: "2026-03-08T00:00:00Z", updatedAt: "2026-03-12T00:00:00Z",
  },
  {
    id: "9", taskId: "TASK-009", title: "Prepare Month 1 Summary", description: "Compile and prepare the Month 1 BMP summary report.",
    assignedBy: "CEO", assignedTo: "Harpinder", category: "Reporting", priority: "Medium", status: "To Do",
    startDate: "2026-03-25", dueDate: "2026-03-31", percentComplete: 0, remarks: "", createdAt: "2026-03-07T00:00:00Z", updatedAt: "2026-03-07T00:00:00Z",
  },
  {
    id: "10", taskId: "TASK-010", title: "CEO Review Meeting Prep", description: "Prepare all materials and agenda for CEO review meeting.",
    assignedBy: "CEO", assignedTo: "Harpinder", category: "Review", priority: "Critical", status: "To Do",
    startDate: "2026-03-10", dueDate: "2026-03-14", percentComplete: 0, remarks: "Urgent - CEO expects full briefing", createdAt: "2026-03-09T00:00:00Z", updatedAt: "2026-03-09T00:00:00Z",
  },
];

export const seedFollowUps: FollowUp[] = [
  { id: "1", taskId: "TASK-008", followUpDate: "2026-03-12", type: "Email", stakeholder: "HR Manager", actionItem: "Request training schedule dates", outcome: "Awaiting response", nextFollowUpDate: "2026-03-14", status: "Pending" },
  { id: "2", taskId: "TASK-004", followUpDate: "2026-03-13", type: "In-Person", stakeholder: "CEO", actionItem: "Submit weekly report draft", outcome: "Minor revisions needed", nextFollowUpDate: "2026-03-14", status: "Pending" },
  { id: "3", taskId: "TASK-003", followUpDate: "2026-03-09", type: "Call", stakeholder: "Vandana Ma'am", actionItem: "Review stakeholder map", outcome: "Approved", nextFollowUpDate: "", status: "Resolved" },
];

export const seedProjectMilestones: ProjectMilestone[] = [
  { month: 1, name: "March 2026", phase: "Foundation", goals: "Complete onboarding, set up tracking systems", keyTasks: ["TASK-001", "TASK-007", "TASK-003"], completionPercent: 35, startDate: "2026-03-01", endDate: "2026-03-31" },
  { month: 2, name: "April 2026", phase: "Deep Dive", goals: "Complete Module 2, begin implementation", keyTasks: [], completionPercent: 0, startDate: "2026-04-01", endDate: "2026-04-30" },
  { month: 3, name: "May 2026", phase: "Implementation", goals: "Execute key processes, stakeholder alignment", keyTasks: [], completionPercent: 0, startDate: "2026-05-01", endDate: "2026-05-31" },
  { month: 4, name: "June 2026", phase: "Optimization", goals: "Refine processes, measure KPIs", keyTasks: [], completionPercent: 0, startDate: "2026-06-01", endDate: "2026-06-30" },
  { month: 5, name: "July 2026", phase: "Scaling", goals: "Scale successful implementations", keyTasks: [], completionPercent: 0, startDate: "2026-07-01", endDate: "2026-07-31" },
  { month: 6, name: "August 2026", phase: "Integration", goals: "Integrate across departments", keyTasks: [], completionPercent: 0, startDate: "2026-08-01", endDate: "2026-08-31" },
  { month: 7, name: "September 2026", phase: "Advanced", goals: "Advanced modules and strategies", keyTasks: [], completionPercent: 0, startDate: "2026-09-01", endDate: "2026-09-30" },
  { month: 8, name: "October 2026", phase: "Mastery", goals: "Master key business frameworks", keyTasks: [], completionPercent: 0, startDate: "2026-10-01", endDate: "2026-10-31" },
  { month: 9, name: "November 2026", phase: "Completion", goals: "Final review, documentation, handover", keyTasks: [], completionPercent: 0, startDate: "2026-11-01", endDate: "2026-11-30" },
];
