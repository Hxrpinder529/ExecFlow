import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc, setDoc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";

// Run this once to migrate user data
export async function migrateUsers() {
  try {
    // Get the Firebase Auth UIDs
    const adminCred = await signInWithEmailAndPassword(auth, "harpinder.singh@rvsolutions.in", "Harpi123");
    const managerCred = await signInWithEmailAndPassword(auth, "harpindersingh529@gmail.com", "harpinder529");
    
    const adminUid = adminCred.user.uid;
    const managerUid = managerCred.user.uid;
    
    console.log("Admin UID:", adminUid);
    console.log("Manager UID:", managerUid);
    
    // Get existing user data from Firestore
    const adminDoc = await getDoc(doc(db, "users", "1"));
    const managerDoc = await getDoc(doc(db, "users", "2f588d90-4847-44c3-82f5-d492f1968d08"));
    
    if (adminDoc.exists()) {
      // Create new document with Auth UID as ID
      await setDoc(doc(db, "users", adminUid), adminDoc.data());
      console.log("Created admin user with UID:", adminUid);
    }
    
    if (managerDoc.exists()) {
      // Create new document with Auth UID as ID
      await setDoc(doc(db, "users", managerUid), managerDoc.data());
      console.log("Created manager user with UID:", managerUid);
    }
    
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration error:", error);
  }
}