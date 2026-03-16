// src/components/SeedDatabase.tsx
import { Button } from "./ui/button";
import { seedDatabase } from "@/scripts/seedFirestore";
import { toast } from "sonner";

export function SeedDatabase() {
  const handleSeed = async () => {
    try {
      await seedDatabase();
      toast.success("Database seeded successfully!");
    } catch (error) {
      toast.error("Failed to seed database");
    }
  };

  return (
    <Button variant="outline" onClick={handleSeed}>
      Seed Database
    </Button>
  );
}