import {
  categories,
  items,
  locations,
  stock,
  stockHistory,
  users,
} from "./schema";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, InferInsertModel, sql } from "drizzle-orm";
import * as bcrypt from "bcrypt";

const seedUsers = async (db: NodePgDatabase<Record<string, never>>) => {
  type LocationInsert = InferInsertModel<typeof locations>;
  type CategoryInsert = InferInsertModel<typeof categories>;
  type ItemInsert = InferInsertModel<typeof items>;
  type StockInsert = InferInsertModel<typeof stock>;
  type StockHistoryInsert = InferInsertModel<typeof stockHistory>;
  type UserInsert = InferInsertModel<typeof users>;

  const locationData: LocationInsert[] = [
    {
      id: "loc1",
      name: "Classroom A101",
      description: "Main classroom for Grade 10",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "loc2",
      name: "Science Lab",
      description: "Laboratory for science experiments",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "loc3",
      name: "Storage Room B",
      description: "Storage for school supplies",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const categoryData: CategoryInsert[] = [
    {
      id: "cat1",
      name: "Textbooks",
      description: "Books used for academic courses",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat2",
      name: "Electronics",
      description: "Electronic devices for teaching",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "cat3",
      name: "Furniture",
      description: "Classroom and office furniture",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const itemData: ItemInsert[] = [
    {
      id: "item1",
      name: "Mathematics Textbook Grade 10",
      quantity: 50,
      categoryId: "cat1",
      supplier: "EduBooks Inc.",
      supplierPhone: "123-456-7890",
      price: 25.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "item2",
      name: "Projector",
      quantity: 5,
      categoryId: "cat2",
      supplier: "TechSupplies Ltd.",
      supplierPhone: "987-654-3210",
      price: 299.99,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "item3",
      name: "Student Desk",
      quantity: 30,
      categoryId: "cat3",
      supplier: "FurnitureCo",
      supplierPhone: "555-123-4567",
      price: 75.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const stockData: StockInsert[] = [
    {
      id: "stock1",
      inventoryItemId: "item1",
      locationId: "loc1",
      quantity: 20,
      status: "Available",
      notes: "Textbooks for Class A101",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "stock2",
      inventoryItemId: "item1",
      locationId: "loc3",
      quantity: 30,
      status: "Available",
      notes: "Stored textbooks",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "stock3",
      inventoryItemId: "item2",
      locationId: "loc2",
      quantity: 3,
      status: "Available",
      notes: "Projectors for Science Lab",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "stock4",
      inventoryItemId: "item3",
      locationId: "loc1",
      quantity: 30,
      status: "Available",
      notes: "Desks for Classroom A101",
      lastUpdated: new Date().toISOString(),
    },
  ];

  const stockHistoryData: StockHistoryInsert[] = [
    {
      stockId: "stock1",
      previousQuantity: 25,
      newQuantity: 20,
      changeReason: "Distributed 5 textbooks to students",
      createdAt: new Date(),
    },
    {
      stockId: "stock2",
      previousQuantity: 0,
      newQuantity: 30,
      changeReason: "Received new shipment of textbooks",
      createdAt: new Date(),
    },
    {
      stockId: "stock3",
      previousQuantity: 2,
      newQuantity: 3,
      changeReason: "Added projector after repair",
      createdAt: new Date(),
    },
  ];
  const userData: UserInsert[] = [
    {
      name: "test test",
      role: "admin",
      password: await bcrypt.hash("test", 10),
      email: "tester@gmail.com",
      username: "tester",
    },
  ];

  try {
    // Insert categories
    await db.insert(users).values(userData);
    console.log("Users seeded");

    // Insert locations
    await db.insert(locations).values(locationData);
    console.log("Locations seeded");

    // Insert categories
    await db.insert(categories).values(categoryData);
    console.log("Categories seeded");

    // Insert items
    await db.insert(items).values(itemData);
    console.log("Items seeded");

    // Insert stock
    await db.insert(stock).values(stockData);
    console.log("Stock seeded");

    // Insert stock history

    // Insert audit logs
  } catch (err) {
    console.error("Something went wrong...");
    console.error(err);
  }
};

const main = async () => {
  console.log("🧨 Started seeding the database...\n");
  const db = drizzle(process.env.DATABASE_URL!);
  await seedUsers(db);
  console.log("\n🧨 Done seeding the database successfully...\n");
};
main();
