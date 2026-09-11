// Run with: npm run seed
// Populates the database with an admin user, a sample user, and sample products.
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Product.deleteMany({});

  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  });

  await User.create({
    name: "Test Customer",
    email: "customer@example.com",
    password: "customer123",
    role: "user",
  });

  const products = [
    {
      name: "Wireless Bluetooth Headphones",
      description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
      price: 79.99,
      discountPrice: 59.99,
      category: "Electronics",
      brand: "SoundWave",
      images: ["https://placehold.co/600x600?text=Headphones"],
      stock: 45,
      createdBy: admin._id,
    },
    {
      name: "Smart Fitness Watch",
      description: "Track heart rate, sleep, and workouts with a 7-day battery and AMOLED display.",
      price: 129.99,
      category: "Electronics",
      brand: "FitTrack",
      images: ["https://placehold.co/600x600?text=Smart+Watch"],
      stock: 30,
      createdBy: admin._id,
    },
    {
      name: "Organic Cotton T-Shirt",
      description: "Soft, breathable, sustainably sourced cotton t-shirt available in multiple colors.",
      price: 19.99,
      category: "Clothing",
      brand: "EcoWear",
      images: ["https://placehold.co/600x600?text=T-Shirt"],
      stock: 100,
      createdBy: admin._id,
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Insulated 750ml bottle that keeps drinks cold for 24 hours or hot for 12.",
      price: 24.99,
      category: "Home & Kitchen",
      brand: "HydroLife",
      images: ["https://placehold.co/600x600?text=Water+Bottle"],
      stock: 60,
      createdBy: admin._id,
    },
    {
      name: "Ergonomic Office Chair",
      description: "Adjustable lumbar support office chair with breathable mesh back.",
      price: 189.99,
      discountPrice: 159.99,
      category: "Furniture",
      brand: "ComfortPlus",
      images: ["https://placehold.co/600x600?text=Office+Chair"],
      stock: 15,
      createdBy: admin._id,
    },
    {
      name: "Non-Stick Frying Pan Set",
      description: "3-piece non-stick frying pan set, oven safe up to 450°F.",
      price: 49.99,
      category: "Home & Kitchen",
      brand: "ChefPro",
      images: ["https://placehold.co/600x600?text=Frying+Pans"],
      stock: 40,
      createdBy: admin._id,
    },
  ];

  await Product.insertMany(products);

  console.log("Seed data inserted successfully.");
  console.log("Admin login: admin@example.com / admin123");
  console.log("Customer login: customer@example.com / customer123");
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
