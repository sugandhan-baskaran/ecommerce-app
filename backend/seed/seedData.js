// Run with: npm run seed
// Populates the database with an admin user, a sample user, and a full demo catalog.
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
      name: "AeroTune Noise-Canceling Headphones",
      description: "Immersive over-ear headphones with adaptive noise cancellation, spatial audio, and a 40-hour battery.",
      price: 179.99,
      discountPrice: 149.99,
      category: "Electronics",
      brand: "AeroTune",
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85"],
      stock: 45,
      ratingsAverage: 4.8,
      ratingsCount: 124,
      createdBy: admin._id,
    },
    {
      name: "Pulse X Smart Watch",
      description: "Track heart rate, sleep, workouts, and recovery with a bright AMOLED display and seven-day battery.",
      price: 229.99,
      discountPrice: 199.99,
      category: "Electronics",
      brand: "Pulse X",
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85"],
      stock: 30,
      ratingsAverage: 4.6,
      ratingsCount: 88,
      createdBy: admin._id,
    },
    {
      name: "Studio Everyday Tee",
      description: "A relaxed, heavyweight organic cotton tee with a soft hand feel and easy everyday fit.",
      price: 38,
      category: "Clothing",
      brand: "Atelier 09",
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85"],
      stock: 100,
      ratingsAverage: 4.7,
      ratingsCount: 64,
      createdBy: admin._id,
    },
    {
      name: "Form Daily Carry Tote",
      description: "Structured recycled canvas tote with an internal laptop sleeve and comfortable wide straps.",
      price: 64,
      discountPrice: 49,
      category: "Clothing",
      brand: "Form Goods",
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=85"],
      stock: 36,
      ratingsAverage: 4.5,
      ratingsCount: 37,
      createdBy: admin._id,
    },
    {
      name: "Therma Steel Bottle",
      description: "Insulated 750ml bottle that keeps drinks cold for 24 hours or hot for 12, finished in powder coat.",
      price: 34,
      category: "Home & Kitchen",
      brand: "Therma",
      images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85"],
      stock: 60,
      ratingsAverage: 4.9,
      ratingsCount: 205,
      createdBy: admin._id,
    },
    {
      name: "Mori Lounge Chair",
      description: "A sculptural lounge chair with supportive curves, natural oak legs, and a soft woven finish.",
      price: 349,
      discountPrice: 299,
      category: "Furniture",
      brand: "Mori Studio",
      images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=900&q=85"],
      stock: 15,
      ratingsAverage: 4.4,
      ratingsCount: 28,
      createdBy: admin._id,
    },
    {
      name: "Noir Pan Set",
      description: "Three-piece ceramic non-stick pan set with stay-cool handles and oven-safe construction.",
      price: 89,
      discountPrice: 69,
      category: "Home & Kitchen",
      brand: "Noir Kitchen",
      images: ["https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=900&q=85"],
      stock: 40,
      ratingsAverage: 4.7,
      ratingsCount: 91,
      createdBy: admin._id,
    },
    {
      name: "Cloud Knit Throw",
      description: "A generous, textural throw blanket woven from a soft cotton blend for slow Sunday mornings.",
      price: 72,
      category: "Home & Kitchen",
      brand: "Haven House",
      images: ["https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85"],
      stock: 24,
      ratingsAverage: 4.8,
      ratingsCount: 42,
      createdBy: admin._id,
    },
    {
      name: "Orbit Desk Lamp",
      description: "A playful adjustable desk lamp with warm dimming and a weighted recycled aluminum base.",
      price: 98,
      category: "Home & Kitchen",
      brand: "Northline",
      images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85"],
      stock: 31,
      ratingsAverage: 4.6,
      ratingsCount: 53,
      createdBy: admin._id,
    },
    {
      name: "Terra Running Sneakers",
      description: "Lightweight everyday runners with a responsive foam sole and breathable engineered mesh upper.",
      price: 128,
      discountPrice: 99,
      category: "Sports",
      brand: "Terra Run",
      images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85"],
      stock: 52,
      ratingsAverage: 4.8,
      ratingsCount: 142,
      createdBy: admin._id,
    },
    {
      name: "Flow Cork Yoga Mat",
      description: "Naturally grippy cork yoga mat with a cushioned rubber base for grounded practice anywhere.",
      price: 58,
      category: "Sports",
      brand: "Flow State",
      images: ["https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=900&q=85"],
      stock: 45,
      ratingsAverage: 4.5,
      ratingsCount: 47,
      createdBy: admin._id,
    },
    {
      name: "Kindred Botanical Candle",
      description: "Hand-poured soy candle with notes of cedar, bergamot, and bright green fig. Burns for 48 hours.",
      price: 32,
      category: "Wellness",
      brand: "Kindred",
      images: ["https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85"],
      stock: 75,
      ratingsAverage: 4.9,
      ratingsCount: 118,
      createdBy: admin._id,
    },
    {
      name: "Lumen Skin Ritual Set",
      description: "A three-step daily ritual with a gentle cleanser, cloud cream, and botanical face oil.",
      price: 86,
      discountPrice: 72,
      category: "Beauty",
      brand: "Lumen",
      images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85"],
      stock: 28,
      ratingsAverage: 4.7,
      ratingsCount: 76,
      createdBy: admin._id,
    },
    {
      name: "Arc Leather Card Holder",
      description: "Slim vegetable-tanned leather card holder with four card slots and a center cash pocket.",
      price: 45,
      category: "Accessories",
      brand: "Arc Objects",
      images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85"],
      stock: 40,
      ratingsAverage: 4.6,
      ratingsCount: 33,
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
