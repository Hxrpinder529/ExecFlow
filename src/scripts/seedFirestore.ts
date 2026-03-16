// src/scripts/seedFirestore.ts
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { seedUsers, seedTasks, seedFollowUps, seedBMPMonths } from "@/data/seed";

const seedDatabase = async () => {
  console.log("Seeding Firestore...");
  
  // Seed users
  for (const user of seedUsers) {
    await setDoc(doc(db, "users", user.id), user);
    // Also seed credentials (temporary)
    const password = user.email === "admin@automatax.in" ? "Admin123" :
                    user.email === "vandana@automatax.in" ? "Vandana123" : "Harpi123";
    await setDoc(doc(db, "credentials", user.email), { password, userId: user.id });
  }
  
  // Seed tasks
  for (const task of seedTasks) {
    await setDoc(doc(db, "tasks", task.id), task);
  }
  
  // Seed follow-ups
  for (const followUp of seedFollowUps) {
    await setDoc(doc(db, "followUps", followUp.id), followUp);
  }
  
  // Seed BMP months
  for (const bmpMonth of seedBMPMonths) {
    await setDoc(doc(db, "bmpMonths", bmpMonth.month.toString()), bmpMonth);
  }
  
  console.log("Seeding complete!");
};