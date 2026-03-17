import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  setDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { Task, FollowUp, ProjectMilestone, WeeklyReport, User, Project } from "@/types";

// Collection names
const COLLECTIONS = {
  USERS: "users",
  TASKS: "tasks",
  FOLLOW_UPS: "followUps",
  PROJECTS: "projects",
  PROJECT_MILESTONES: "projectMilestones",
  WEEKLY_REPORTS: "weeklyReports",
  CREDENTIALS: "credentials"
};

// Helper to convert Firestore timestamps to strings
const convertTimestamps = (data: any): any => {
  const converted: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate().toISOString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      converted[key] = convertTimestamps(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.USERS));
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamps(doc.data()) 
  } as User));
};

export const addUser = async (user: User, password: string): Promise<void> => {
  try {
    console.log("Adding user to Firestore with ID:", user.id);
    
    const userRef = doc(db, COLLECTIONS.USERS, user.id);
    await setDoc(userRef, user);
    console.log("User document created in Firestore");
    
    const credRef = doc(db, COLLECTIONS.CREDENTIALS, user.email);
    await setDoc(credRef, { password, userId: user.id });
    console.log("Credentials stored (temporary)");
    
  } catch (error) {
    console.error("Error in addUserService:", error);
    throw error;
  }
};

export const updateUser = async (user: User): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, user.id);
  await updateDoc(userRef, { ...user });
};

export const deleteUser = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.USERS, id));
};

export const toggleUserActive = async (id: string, isActive: boolean): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, id);
  await updateDoc(userRef, { isActive: !isActive });
};

// Tasks - with user filtering
export const fetchTasks = async (userId: string, isAdmin: boolean = false): Promise<Task[]> => {
  let q;
  if (isAdmin) {
    // Admins can see all tasks
    q = collection(db, COLLECTIONS.TASKS);
  } else {
    // Regular users see tasks assigned to them OR created by them
    q = query(
      collection(db, COLLECTIONS.TASKS),
      where("assignedTo", "==", userId)
    );
    // Note: This only filters by assignedTo. For createdBy, we'll combine in AppContext
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamps(doc.data()) 
  } as Task));
};

export const addTask = async (task: Task): Promise<void> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, task.id);
  await setDoc(taskRef, task);
};

export const updateTask = async (task: Task): Promise<void> => {
  const taskRef = doc(db, COLLECTIONS.TASKS, task.id);
  await updateDoc(taskRef, { ...task });
};

export const deleteTask = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.TASKS, id));
};

// Follow-ups - with user filtering via tasks
export const fetchFollowUps = async (userId: string, isAdmin: boolean = false): Promise<FollowUp[]> => {
  if (isAdmin) {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.FOLLOW_UPS));
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...convertTimestamps(doc.data()) 
    } as FollowUp));
  }
  
  // First get tasks assigned to user
  const tasksQuery = query(
    collection(db, COLLECTIONS.TASKS),
    where("assignedTo", "==", userId)
  );
  const tasksSnapshot = await getDocs(tasksQuery);
  const taskIds = tasksSnapshot.docs.map(doc => doc.id);
  
  if (taskIds.length === 0) return [];
  
  // Then get follow-ups for those tasks
  const followUpsQuery = query(
    collection(db, COLLECTIONS.FOLLOW_UPS),
    where("taskId", "in", taskIds)
  );
  const followUpsSnapshot = await getDocs(followUpsQuery);
  
  return followUpsSnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamps(doc.data()) 
  } as FollowUp));
};

export const addFollowUp = async (followUp: FollowUp): Promise<void> => {
  const followUpRef = doc(db, COLLECTIONS.FOLLOW_UPS, followUp.id);
  await setDoc(followUpRef, followUp);
};

export const updateFollowUp = async (followUp: FollowUp): Promise<void> => {
  const followUpRef = doc(db, COLLECTIONS.FOLLOW_UPS, followUp.id);
  await updateDoc(followUpRef, { ...followUp });
};

export const deleteFollowUp = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.FOLLOW_UPS, id));
};

// Projects - all users can see all projects (team-wide), but we add createdBy for editing permissions
export const fetchProjects = async (): Promise<Project[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.PROJECTS));
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamps(doc.data()) 
  } as Project));
};

export const addProject = async (project: Project): Promise<void> => {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, project.id);
  await setDoc(projectRef, project);
};

export const updateProject = async (project: Project): Promise<void> => {
  const projectRef = doc(db, COLLECTIONS.PROJECTS, project.id);
  await updateDoc(projectRef, { ...project });
};

export const deleteProject = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id));
  
  // Also delete all milestones associated with this project
  const milestonesQuery = query(collection(db, COLLECTIONS.PROJECT_MILESTONES), where("projectId", "==", id));
  const milestonesSnapshot = await getDocs(milestonesQuery);
  
  const deletePromises = milestonesSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};

// Project Milestones
export const fetchMilestones = async (projectId?: string): Promise<ProjectMilestone[]> => {
  let q = collection(db, COLLECTIONS.PROJECT_MILESTONES);
  
  if (projectId) {
    q = query(q, where("projectId", "==", projectId)) as any;
  }
  
  const querySnapshot = await getDocs(q as any);
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamps(doc.data()) 
  } as ProjectMilestone));
};

export const addMilestone = async (milestone: ProjectMilestone): Promise<void> => {
  const milestoneRef = doc(db, COLLECTIONS.PROJECT_MILESTONES, milestone.id);
  await setDoc(milestoneRef, milestone);
};

export const updateMilestone = async (milestone: ProjectMilestone): Promise<void> => {
  const milestoneRef = doc(db, COLLECTIONS.PROJECT_MILESTONES, milestone.id);
  await updateDoc(milestoneRef, { ...milestone });
};

export const deleteMilestone = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTIONS.PROJECT_MILESTONES, id));
};

export const fetchWeeklyReports = async (): Promise<WeeklyReport[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTIONS.WEEKLY_REPORTS));
  return querySnapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...convertTimestamps(doc.data()) 
  } as WeeklyReport));
};

export const addWeeklyReport = async (report: WeeklyReport): Promise<void> => {
  const reportRef = doc(db, COLLECTIONS.WEEKLY_REPORTS, report.id);
  await setDoc(reportRef, report);
};

// Credentials
export const verifyCredentials = async (email: string, password: string): Promise<string | null> => {
  const credRef = doc(db, COLLECTIONS.CREDENTIALS, email);
  const credDoc = await getDoc(credRef);
  
  if (credDoc.exists() && credDoc.data().password === password) {
    return credDoc.data().userId;
  }
  return null;
};