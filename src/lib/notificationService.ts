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
import { Notification, Task, FollowUp } from "@/types";

const COLLECTION = "notifications";

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

// Fetch notifications for a user
export const fetchUserNotifications = async (userId: string, limitCount = 50): Promise<Notification[]> => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  } as Notification));
};

// Fetch unread count
export const fetchUnreadCount = async (userId: string): Promise<number> => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.size;
};

// Create a notification
export const createNotification = async (notification: Omit<Notification, "id">): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...notification,
    createdAt: new Date().toISOString(),
    read: false
  });
  return docRef.id;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  const docRef = doc(db, COLLECTION, notificationId);
  await updateDoc(docRef, { read: true });
};

// Mark all as read for a user
export const markAllAsRead = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("read", "==", false)
  );
  
  const querySnapshot = await getDocs(q);
  const updatePromises = querySnapshot.docs.map(doc => 
    updateDoc(doc.ref, { read: true })
  );
  
  await Promise.all(updatePromises);
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  await deleteDoc(doc(db, COLLECTION, notificationId));
};

// Clear all read notifications for a user
export const clearReadNotifications = async (userId: string): Promise<void> => {
  const q = query(
    collection(db, COLLECTION),
    where("userId", "==", userId),
    where("read", "==", true)
  );
  
  const querySnapshot = await getDocs(q);
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
};