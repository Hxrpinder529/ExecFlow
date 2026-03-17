import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit
} from "firebase/firestore";
import { ActivityLog, Task, User } from "@/types";

const COLLECTION = "activityLogs";

// Convert Firestore timestamps to strings
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

// Fetch activity logs for a task
export const fetchTaskActivity = async (taskId: string, limitCount = 50): Promise<ActivityLog[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("taskId", "==", taskId),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  } as ActivityLog));
};

// Fetch recent activity across all tasks (for dashboard)
export const fetchRecentActivity = async (limitCount = 20): Promise<ActivityLog[]> => {
  const q = query(
    collection(db, COLLECTION),
    orderBy("timestamp", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  } as ActivityLog));
};

// Create activity log entry
export const createActivityLog = async (log: Omit<ActivityLog, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...log,
    timestamp: new Date().toISOString()
  });
  return docRef.id;
};

// Delete old activity logs (optional cleanup)
export const deleteOldActivityLogs = async (daysToKeep = 30): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const q = query(
    collection(db, COLLECTION),
    where("timestamp", "<", cutoffDate.toISOString())
  );
  
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};