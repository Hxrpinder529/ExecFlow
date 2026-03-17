import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { createActivityLog } from "@/lib/activityService";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Task, FollowUp, ProjectMilestone, WeeklyReport, User, UserRole, defaultPermissions, UserPermissions, Project, Notification } from "@/types";
import { seedTasks, seedFollowUps, seedProjectMilestones, seedUsers } from "@/data/seed";
import { createNotification, markAsRead, clearReadNotifications } from "@/lib/notificationService";
import {
  fetchUsers,
  addUser as addUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
  toggleUserActive as toggleUserActiveService,
  fetchTasks,
  addTask as addTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
  fetchFollowUps,
  addFollowUp as addFollowUpService,
  updateFollowUp as updateFollowUpService,
  deleteFollowUp as deleteFollowUpService,
  fetchProjects,
  addProject as addProjectService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
  fetchMilestones,
  addMilestone as addMilestoneService,
  updateMilestone as updateMilestoneService,
  deleteMilestone as deleteMilestoneService,
  fetchWeeklyReports,
  addWeeklyReport as addWeeklyReportService,
  verifyCredentials
} from "@/lib/firestoreService";

interface AppContextType {
  user: User | null;
  users: User[];
  tasks: Task[];
  followUps: FollowUp[];
  projects: Project[];
  milestones: ProjectMilestone[];
  weeklyReports: WeeklyReport[];
  theme: "light" | "dark";
  loading: boolean;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setTheme: (t: "light" | "dark") => void;

  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  addFollowUp: (f: FollowUp) => Promise<void>;
  updateFollowUp: (f: FollowUp) => Promise<void>;
  deleteFollowUp: (id: string) => Promise<void>;

  // Projects
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Milestones
  addMilestone: (milestone: ProjectMilestone) => Promise<void>;
  updateMilestone: (milestone: ProjectMilestone) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  getMilestonesByProject: (projectId: string) => ProjectMilestone[];

  addWeeklyReport: (r: WeeklyReport) => Promise<void>;

  getNextTaskId: () => string;

  addUser: (u: User, password: string) => Promise<void>;
  updateUser: (u: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;

  updateUserPermissions: (id: string, perms: UserPermissions) => Promise<void>;
  updateUserRole: (id: string, role: UserRole) => Promise<void>;

  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  logActivity?: (taskId: string, action: ActivityAction, details?: any) => Promise<void>;

  // ✅ Accent color
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);

  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("app_theme") as "light" | "dark") || "light";
  });

  const [loading, setLoading] = useState(true);

  // ✅ Accent color state — loads from localStorage first, then falls back to default
  const [accentColor, setAccentColorState] = useState<string>(() => {
    const saved = localStorage.getItem("app_accent");
    if (saved) return saved;
    return "38 92% 55%"; // Default amber
  });

  // Activity logging helper
  const logActivity = useCallback(async (
    taskId: string,
    action: ActivityAction,
    details: {
      field?: string;
      oldValue?: any;
      newValue?: any;
      metadata?: any;
    } = {}
  ) => {
    if (!user) return;
    
    await createActivityLog({
      taskId,
      userId: user.id,
      userName: user.name,
      action,
      field: details.field,
      oldValue: details.oldValue,
      newValue: details.newValue,
      metadata: details.metadata,
      timestamp: new Date().toISOString()
    });
  }, [user]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        const [
          usersData,
          tasksData,
          followUpsData,
          projectsData,
          milestonesData,
          reportsData
        ] = await Promise.all([
          fetchUsers(),
          fetchTasks(),
          fetchFollowUps(),
          fetchProjects(),
          fetchMilestones(),
          fetchWeeklyReports()
        ]);

        setUsers(usersData);
        setTasks(tasksData);
        setFollowUps(followUpsData);
        setProjects(projectsData);
        setMilestones(milestonesData);
        setWeeklyReports(reportsData);

        console.log("Data loaded from Firestore:", {
          users: usersData.length,
          tasks: tasksData.length,
          followUps: followUpsData.length,
          projects: projectsData.length,
          milestones: milestonesData.length,
          reports: reportsData.length
        });

      } catch (error) {
        console.error("Error loading data from Firestore:", error);
        setUsers([]);
        setTasks([]);
        setFollowUps([]);
        setProjects([]);
        setMilestones([]);
        setWeeklyReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Try to find user by UID first (new structure)
          let userData = users.find(u => u.id === firebaseUser.uid);
          
          // If not found, try by email (old structure)
          if (!userData) {
            userData = users.find(u => u.email === firebaseUser.email);
          }
          
          // If found by email but ID doesn't match UID, update the document
          if (userData && userData.id !== firebaseUser.uid) {
            console.log("Migrating user document to use Auth UID as ID");
            const newUserData = { ...userData, id: firebaseUser.uid };
            await setDoc(doc(db, "users", firebaseUser.uid), newUserData);
            setUsers(prev => prev.map(u => 
              u.email === firebaseUser.email ? newUserData : u
            ));
            userData = newUserData;
          }
          
          setUser(userData || null);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        toast.error("Error syncing user data");
      }
    });

    return () => unsubscribe();
  }, [users]);

  // ✅ Apply user's saved accent color when they log in
  // Runs whenever user?.accentColor changes (e.g., after login/profile load)
  useEffect(() => {
    if (user?.accentColor) {
      // Apply directly to avoid circular dependency through setAccentColor → updateUser
      setAccentColorState(user.accentColor);
      localStorage.setItem("app_accent", user.accentColor);
      document.documentElement.style.setProperty('--accent', user.accentColor);
      document.documentElement.style.setProperty('--ring', user.accentColor);
      document.documentElement.style.setProperty('--sidebar-primary', user.accentColor);
      document.documentElement.style.setProperty('--sidebar-ring', user.accentColor);
      document.documentElement.style.setProperty('--chart-2', user.accentColor);
    }
  }, [user?.accentColor]);

  // Define checkDeadlinesAndNotify BEFORE the useEffect that uses it
  const checkDeadlinesAndNotify = useCallback(async () => {
    if (!user) return;
  
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    // Check tasks
    tasks.forEach(async (task) => {
      if (task.status === "Completed") return;
  
      const dueDate = new Date(task.dueDate);
  
      if (dueDate.toDateString() === tomorrow.toDateString()) {
        await createNotification({
          userId: user.id,
          type: "task_due",
          title: "Task Due Tomorrow",
          message: `${task.taskId}: ${task.title}`,
          link: `/tasks?task=${task.id}`,
          read: false,
          priority: "medium",
          createdAt: new Date().toISOString(),
          data: { taskId: task.id }
        });
      }
  
      if (dueDate < now) {
        await createNotification({
          userId: user.id,
          type: "task_overdue",
          title: "Task Overdue",
          message: `${task.taskId}: ${task.title}`,
          link: `/tasks?task=${task.id}`,
          read: false,
          priority: "high",
          createdAt: new Date().toISOString(),
          data: { taskId: task.id }
        });
      }
    });
  
    // Check follow-ups
    followUps.forEach(async (followUp) => {
      if (followUp.status !== "Pending") return;
  
      const followUpDate = new Date(followUp.followUpDate);
  
      if (followUpDate.toDateString() === tomorrow.toDateString()) {
        await createNotification({
          userId: user.id,
          type: "followup_due",
          title: "Follow-up Due Tomorrow",
          message: `${followUp.actionItem} for ${followUp.stakeholder}`,
          link: `/follow-ups?followup=${followUp.id}`,
          read: false,
          priority: "medium",
          createdAt: new Date().toISOString(),
          data: { followUpId: followUp.id, taskId: followUp.taskId }
        });
      }
  
      if (followUpDate < now) {
        await createNotification({
          userId: user.id,
          type: "followup_due",
          title: "Follow-up Overdue",
          message: `${followUp.actionItem} for ${followUp.stakeholder}`,
          link: `/follow-ups?followup=${followUp.id}`,
          read: false,
          priority: "high",
          createdAt: new Date().toISOString(),
          data: { followUpId: followUp.id, taskId: followUp.taskId }
        });
      }
    });
  
  }, [user, tasks, followUps]);

  // Theme effect
  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // Run deadline checks when user logs in and every hour
  useEffect(() => {
    if (user) {
      checkDeadlinesAndNotify();
  
      const interval = setInterval(() => {
        checkDeadlinesAndNotify();
      }, 60 * 60 * 1000);
  
      return () => clearInterval(interval);
    }
  }, [user, checkDeadlinesAndNotify]);

  const setTheme = useCallback((t: "light" | "dark") => {
    setThemeState(t);
  }, []);

  // ✅ setAccentColor — applies CSS vars, persists to localStorage & Firestore user profile
  const setAccentColor = useCallback((color: string) => {
    setAccentColorState(color);
    localStorage.setItem("app_accent", color);

    document.documentElement.style.setProperty('--accent', color);
    document.documentElement.style.setProperty('--ring', color);
    document.documentElement.style.setProperty('--sidebar-primary', color);
    document.documentElement.style.setProperty('--sidebar-ring', color);
    document.documentElement.style.setProperty('--chart-2', color);

    // Persist to user profile in Firestore if logged in
    if (user) {
      updateUser({ ...user, accentColor: color });
    }
  }, [user]); 

  // LOGIN
  const login = useCallback(async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      let userData = users.find(u => u.id === firebaseUser.uid);
      if (!userData) {
        userData = users.find(u => u.email === firebaseUser.email);
      }

      if (userData && userData.isActive) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      const userId = await verifyCredentials(email, password);
      if (userId) {
        const userData = users.find(u => u.id === userId);
        if (userData && userData.isActive) {
          setUser(userData);
          return true;
        }
      }
      return false;
    }
  }, [users]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  // TASK ID
  const getNextTaskId = useCallback(() => {
    const max = tasks.reduce((m, t) => {
      const num = parseInt(t.taskId.replace("TASK-", ""));
      return num > m ? num : m;
    }, 0);
    return `TASK-${String(max + 1).padStart(3, "0")}`;
  }, [tasks]);

  // TASKS
  const addTask = useCallback(async (task: Task) => {
    await addTaskService(task);
    setTasks(prev => [...prev, task]);
    
    await logActivity(task.id, "created", {
      metadata: {
        title: task.title,
        status: task.status,
        priority: task.priority
      }
    });
  }, [logActivity]);

  const updateTask = useCallback(async (task: Task) => {
    const oldTask = tasks.find(t => t.id === task.id);
    await updateTaskService(task);
    setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    
    if (oldTask) {
      if (oldTask.status !== task.status) {
        await logActivity(task.id, "status_changed", {
          metadata: {
            fromStatus: oldTask.status,
            toStatus: task.status
          }
        });
        
        if (task.status === "Completed") {
          await logActivity(task.id, "completed");
        }
      }
      
      if (oldTask.assignedTo !== task.assignedTo) {
        await logActivity(task.id, "assigned", {
          oldValue: oldTask.assignedTo,
          newValue: task.assignedTo
        });
      }
      
      if (oldTask.priority !== task.priority) {
        await logActivity(task.id, "priority_changed", {
          metadata: {
            fromPriority: oldTask.priority,
            toPriority: task.priority
          }
        });
      }
      
      if (oldTask.dueDate !== task.dueDate) {
        await logActivity(task.id, "due_date_changed", {
          oldValue: oldTask.dueDate,
          newValue: task.dueDate
        });
      }
      
      if (oldTask.percentComplete !== task.percentComplete) {
        await logActivity(task.id, "progress_updated", {
          metadata: {
            fromPercent: oldTask.percentComplete,
            toPercent: task.percentComplete
          }
        });
      }
      
      const changedFields = Object.keys(task).filter(key => 
        task[key as keyof Task] !== oldTask[key as keyof Task] &&
        !["status", "assignedTo", "priority", "dueDate", "percentComplete", "updatedAt"].includes(key)
      );
      
      for (const field of changedFields) {
        await logActivity(task.id, "updated", {
          field,
          oldValue: oldTask[field as keyof Task],
          newValue: task[field as keyof Task]
        });
      }
    }
  }, [tasks, logActivity]);

  const deleteTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await deleteTaskService(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      
      await logActivity(id, "deleted", {
        metadata: {
          title: task.title,
          status: task.status,
          priority: task.priority
        }
      });
    }
  }, [tasks, logActivity]);

  // FOLLOWUPS
  const addFollowUp = useCallback(async (followUp: FollowUp) => {
    await addFollowUpService(followUp);
    setFollowUps(prev => [...prev, followUp]);
  }, []);

  const updateFollowUp = useCallback(async (followUp: FollowUp) => {
    await updateFollowUpService(followUp);
    setFollowUps(prev => prev.map(f => f.id === followUp.id ? followUp : f));
  }, []);

  const deleteFollowUp = useCallback(async (id: string) => {
    await deleteFollowUpService(id);
    setFollowUps(prev => prev.filter(f => f.id !== id));
  }, []);

  // PROJECTS
  const addProject = useCallback(async (project: Project) => {
    await addProjectService(project);
    setProjects(prev => [...prev, project]);
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    await updateProjectService(project);
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await deleteProjectService(id);
    setMilestones(prev => prev.filter(m => m.projectId !== id));
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  // MILESTONES
  const addMilestone = useCallback(async (milestone: ProjectMilestone) => {
    await addMilestoneService(milestone);
    setMilestones(prev => [...prev, milestone]);
  }, []);

  const updateMilestone = useCallback(async (milestone: ProjectMilestone) => {
    await updateMilestoneService(milestone);
    setMilestones(prev => prev.map(m => m.id === milestone.id ? milestone : m));
  }, []);

  const deleteMilestone = useCallback(async (id: string) => {
    await deleteMilestoneService(id);
    setMilestones(prev => prev.filter(m => m.id !== id));
  }, []);

  const getMilestonesByProject = useCallback((projectId: string) => {
    return milestones.filter(m => m.projectId === projectId);
  }, [milestones]);

  // REPORTS
  const addWeeklyReport = useCallback(async (report: WeeklyReport) => {
    await addWeeklyReportService(report);
    setWeeklyReports(prev => [...prev, report]);
  }, []);

  // USERS
  const addUser = useCallback(async (newUser: User, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, password);
      const firebaseUser = userCredential.user;
      const userWithAuthId = { ...newUser, id: firebaseUser.uid };

      await addUserService(userWithAuthId, password);
      setUsers(prev => [...prev, userWithAuthId]);
      
      toast.success(`User ${newUser.name} created successfully in Authentication and Firestore`);
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error("This email is already registered in Authentication");
      } else if (error.code === 'auth/weak-password') {
        toast.error("Password should be at least 6 characters");
      } else {
        toast.error("Failed to create user in Authentication");
      }
    }
  }, []);

  const updateUser = useCallback(async (updatedUser: User) => {
    await updateUserService(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user && confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await deleteUserService(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        toast.success("User deleted from Firestore");
        toast.info("User still exists in Authentication. Delete manually from Firebase Console if needed.");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  }, [users]);

  const toggleUserActive = useCallback(async (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      try {
        await toggleUserActiveService(id, user.isActive);
        if (user.email) {
          console.log("User toggled:", user.email);
        }
        
        setUsers(prev =>
          prev.map(u =>
            u.id === id ? { ...u, isActive: !u.isActive } : u
          )
        );
        
        toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      } catch (error) {
        console.error("Error toggling user:", error);
        toast.error("Failed to update user");
      }
    }
  }, [users]);

  const updateUserPermissions = useCallback(async (id: string, perms: UserPermissions) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const updatedUser = { ...user, permissions: perms };
      await updateUserService(updatedUser);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    }
  }, [users]);

  const updateUserRole = useCallback(async (id: string, role: UserRole) => {
    const user = users.find(u => u.id === id);
    if (user) {
      const updatedUser = {
        ...user,
        role,
        permissions: defaultPermissions[role]
      };
      await updateUserService(updatedUser);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
    }
  }, [users]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    await markAsRead(notificationId);
  }, []);
  
  const clearAllNotifications = useCallback(async () => {
    if (user) {
      await clearReadNotifications(user.id);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        users,
        tasks,
        followUps,
        projects,
        milestones,
        weeklyReports,
        theme,
        loading,
  
        login,
        logout,
        setTheme,
  
        addTask,
        updateTask,
        deleteTask,
  
        addFollowUp,
        updateFollowUp,
        deleteFollowUp,
  
        addProject,
        updateProject,
        deleteProject,
  
        addMilestone,
        updateMilestone,
        deleteMilestone,
        getMilestonesByProject,
  
        addWeeklyReport,
  
        getNextTaskId,
  
        addUser,
        updateUser,
        deleteUser,
        toggleUserActive,
        updateUserPermissions,
        updateUserRole,
  
        markNotificationAsRead,
        clearAllNotifications,
  
        logActivity,

        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
