import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const foods = [
  ["Cooked Rice", 12, 2.7, 28, 0.3, 130, "veg"],
  ["Brown Rice", 18, 2.6, 23, 0.9, 112, "veg"],
  ["Roti", 8, 3.1, 18, 3.7, 120, "veg"],
  ["Chapati", 7, 3, 17, 3, 110, "veg"],
  ["Oats", 18, 5, 27, 3, 154, "veg"],
  ["Poha", 20, 3.5, 36, 2.5, 180, "veg"],
  ["Upma", 22, 4, 32, 5, 190, "veg"],
  ["Idli", 10, 2, 12, 0.4, 58, "veg"],
  ["Dosa", 25, 4, 30, 7, 200, "veg"],
  ["Moong Dal", 16, 7, 19, 0.8, 110, "veg"],
  ["Toor Dal", 18, 8, 22, 1, 130, "veg"],
  ["Masoor Dal", 17, 9, 20, 0.7, 120, "veg"],
  ["Chana Dal", 18, 8, 22, 1.5, 135, "veg"],
  ["Rajma", 24, 8.7, 22.8, 0.5, 127, "veg"],
  ["Chole", 22, 8.9, 27, 2.6, 164, "veg"],
  ["Black Chana", 20, 9, 27, 2, 165, "veg"],
  ["Soy Chunks", 20, 26, 16, 0.5, 172, "veg"],
  ["Tofu", 35, 12, 2, 7, 120, "veg"],
  ["Paneer", 45, 18, 3, 20, 265, "veg"],
  ["Low Fat Paneer", 50, 21, 4, 8, 170, "veg"],
  ["Curd", 15, 4, 5, 3, 70, "veg"],
  ["Greek Yogurt", 45, 10, 4, 0.5, 60, "veg"],
  ["Milk", 18, 6.4, 9.6, 6.4, 122, "veg"],
  ["Whey Protein", 75, 24, 3, 2, 125, "veg"],
  ["Peanut Butter", 20, 8, 6, 16, 190, "veg"],
  ["Peanuts", 12, 7, 5, 14, 165, "veg"],
  ["Almonds", 30, 6, 6, 14, 164, "veg"],
  ["Banana", 8, 1.3, 27, 0.3, 105, "veg"],
  ["Apple", 20, 0.5, 25, 0.3, 95, "veg"],
  ["Potato", 10, 2, 26, 0.1, 110, "veg"],
  ["Sweet Potato", 18, 2, 24, 0.1, 103, "veg"],
  ["Mixed Vegetables", 18, 3, 14, 0.5, 80, "veg"],
  ["Spinach", 12, 2.9, 3.6, 0.4, 23, "veg"],
  ["Sprouts", 15, 7, 16, 1, 100, "veg"],
  ["Egg Whole", 8, 6.3, 0.4, 5, 72, "egg"],
  ["Egg Whites", 10, 11, 0.7, 0.2, 52, "egg"],
  ["Omelette", 25, 13, 2, 11, 160, "egg"],
  ["Boiled Eggs", 16, 12.6, 0.8, 10, 144, "egg"],
  ["Chicken Breast", 60, 31, 0, 3.6, 165, "non_veg"],
  ["Chicken Thigh", 50, 24, 0, 9, 190, "non_veg"],
  ["Fish Curry", 65, 22, 4, 9, 190, "non_veg"],
  ["Tuna", 80, 25, 0, 1, 110, "non_veg"],
  ["Prawns", 85, 24, 0.2, 1, 115, "non_veg"],
  ["Mutton Curry", 90, 20, 3, 18, 260, "non_veg"],
  ["Chicken Keema", 70, 26, 2, 10, 210, "non_veg"],
  ["Quinoa", 45, 4.4, 21.3, 1.9, 120, "veg"],
  ["Besan Chilla", 25, 9, 18, 6, 160, "veg"],
  ["Sattu Drink", 18, 7, 20, 2, 125, "veg"],
  ["Khichdi", 25, 8, 35, 4, 210, "veg"],
  ["Dal Dhokli", 35, 9, 42, 6, 260, "veg"]
];

async function main() {
  await prisma.food.createMany({
    data: foods.map(([name, costPerServing, protein, carbs, fat, calories, category]) => ({
      name,
      costPerServing,
      protein,
      carbs,
      fat,
      calories,
      category,
      isCommonIndianFood: true
    })),
    skipDuplicates: true
  });

  if (process.env.NODE_ENV === "production") return;

  await prisma.user.upsert({
    where: { email: "demo@fitness.local" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@fitness.local",
      passwordHash: "$2b$10$C4qO8W8q9v4X9WyOy2LBUeaUx2/pY5AfE1PQRnrYo9P2kveUG5xT2",
      age: 21,
      weight: 72,
      height: 175,
      activityLevel: "moderate",
      dietPreference: "flexible",
      trainingExperience: "intermediate"
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
