export type UserRole = "Admin" | "Manager" | "Implementor";

export interface UserPermissions {
  canCreateTasks: boolean;
  canEditTasks: boolean;
  canDeleteTasks: boolean;
  canViewDashboard: boolean;
  canManageFollowUps: boolean;
  canManageTimeline: boolean;
  canGenerateReports: boolean;
  canManageUsers: boolean;
}

export const defaultPermissions: Record<UserRole, UserPermissions> = {
  Admin: { canCreateTasks: true, canEditTasks: true, canDeleteTasks: true, canViewDashboard: true, canManageFollowUps: true, canManageTimeline: true, canGenerateReports: true, canManageUsers: true },
  Manager: { canCreateTasks: true, canEditTasks: true, canDeleteTasks: false, canViewDashboard: true, canManageFollowUps: true, canManageTimeline: true, canGenerateReports: true, canManageUsers: false },
  Implementor: { canCreateTasks: true, canEditTasks: true, canDeleteTasks: false, canViewDashboard: true, canManageFollowUps: true, canManageTimeline: false, canGenerateReports: false, canManageUsers: false },
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  permissions: UserPermissions;
}

export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type TaskStatus = "To Do" | "In Progress" | "Under Review" | "Completed" | "On Hold";
export type TaskCategory = "Operations" | "Implementation" | "Coordination" | "Reporting" | "Review" | "Automation" | "Process Improvement" | "Other";
export type AssignedBy = "Director" | "CEO" | "Self" | "BU Head";
export type AssignedTo = string;

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description: string;
  assignedBy: AssignedBy;
  assignedTo: string;
  requestedBy?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  percentComplete: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export type FollowUpType = "Call" | "Email" | "In-Person" | "WhatsApp";
export type FollowUpStatus = "Pending" | "Resolved" | "Escalated";

export interface FollowUp {
  id: string;
  taskId: string;
  followUpDate: string;
  type: FollowUpType;
  stakeholder: string;
  actionItem: string;
  outcome: string;
  nextFollowUpDate: string;
  status: FollowUpStatus;
}

export interface ProjectPlanItem {
  id: string;
  title: string;
  description: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: "Not Started" | "In Progress" | "Completed" | "Delayed";
  progress: number;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department: string;
  plan: ProjectPlanItem[];
  startDate: string;
  endDate: string;
  status: "Active" | "On Hold" | "Completed" | "Cancelled";
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasksCompleted: string[];
  tasksPending: string[];
  tasksOverdue: string[];
  newTasksAdded: string[];
  achievements: string;
  challenges: string;
  nextWeekPlan: string;
  ceoNotes: string;
  createdAt: string;
}