// Run with: npm run seed
// Resets the database to a clean demo state: an admin user, a sample customer, and the product catalogue.
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

dotenv.config();

const image = (photoId) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&h=600&q=80`;

// [name, description, price, discountPrice, category, brand, photoId, stock, ratingsAverage, ratingsCount]
const catalogue = [
  ["Wireless Noise-Cancelling Headphones", "Over-ear headphones with active noise cancellation, plush memory-foam cushions and 30-hour battery life.", 199.99, 149.99, "Electronics", "SoundWave", "1505740420928-5e560c06d30e", 45, 4.7, 312],
  ["Studio Monitor Headphones", "Closed-back reference headphones with a detachable cable and a flat, detailed sound signature.", 129.99, 0, "Electronics", "SoundWave", "1583394838336-acd977736f90", 28, 4.5, 96],
  ["Minimalist Analog Watch", "Slim stainless-steel case, sapphire glass and a genuine leather strap. Water resistant to 50m.", 149.99, 119.99, "Accessories", "Meridian", "1523275335684-37898b6baf30", 35, 4.6, 184],
  ["Smart Fitness Watch", "Track heart rate, sleep and workouts with built-in GPS, a 7-day battery and an always-on AMOLED display.", 229.99, 189.99, "Electronics", "FitTrack", "1546868871-7041f2a55e12", 30, 4.4, 421],
  ["Flagship 5G Smartphone", "6.5-inch OLED display, triple-lens camera system and all-day battery with fast wireless charging.", 799.99, 749.99, "Electronics", "Nova", "1511707171634-5f897ff02aa9", 22, 4.8, 530],
  ["Ultrabook Laptop 14\"", "Featherweight aluminium laptop with a 14-inch 2.8K display, 16GB RAM and a 512GB SSD.", 1199.99, 1049.99, "Electronics", "Vertex", "1496181133206-80ce9b88a853", 12, 4.7, 208],
  ["Ergonomic Wireless Mouse", "Sculpted shape, silent clicks and a 70-day rechargeable battery. Pairs with up to three devices.", 49.99, 39.99, "Electronics", "Vertex", "1527864550417-7fd91fc51a46", 80, 4.5, 267],
  ["Mechanical Keyboard", "Hot-swappable tactile switches, PBT keycaps and per-key RGB lighting in a compact 75% layout.", 109.99, 0, "Electronics", "KeyForge", "1587829741301-dc798b83add3", 40, 4.6, 345],
  ["Portable Bluetooth Speaker", "Room-filling 360° sound, IP67 waterproofing and 20 hours of playtime in a go-anywhere body.", 89.99, 69.99, "Electronics", "SoundWave", "1608043152269-423dbba4e7e1", 55, 4.3, 158],
  ["Instant Film Camera", "Point, shoot and print credit-card-sized photos in seconds. Includes selfie mirror and close-up lens.", 99.99, 0, "Electronics", "Lumen", "1526170375885-4d8ecf77b99f", 26, 4.4, 121],
  ["Running Sneakers", "Lightweight knit upper with responsive foam cushioning built for daily miles.", 119.99, 89.99, "Footwear", "Stride", "1542291026-7eec264c27ff", 60, 4.6, 489],
  ["Everyday Trainers", "Versatile low-top trainers with a cushioned insole and durable rubber outsole.", 84.99, 0, "Footwear", "Stride", "1491553895911-0055eca6402d", 48, 4.2, 173],
  ["Classic Sunglasses", "Polarised UV400 lenses in a timeless acetate frame. Comes with a hard case and cleaning cloth.", 59.99, 44.99, "Accessories", "Meridian", "1572635196237-14b3f281503f", 70, 4.3, 142],
  ["Leather Tote Handbag", "Full-grain leather tote with a zipped inner pocket and room for a 13-inch laptop.", 139.99, 0, "Accessories", "Atelier", "1584917865442-de89df76afd3", 18, 4.7, 88],
  ["Everyday Backpack", "Water-resistant 22L backpack with a padded laptop sleeve and hidden anti-theft pocket.", 69.99, 54.99, "Accessories", "Trailhead", "1553062407-98eeb64c6a62", 52, 4.5, 231],
  ["Organic Cotton T-Shirt", "Soft, breathable, sustainably sourced cotton tee with a relaxed everyday fit.", 24.99, 0, "Clothing", "EcoWear", "1521572163474-6864f9cf17ab", 120, 4.4, 402],
  ["Leather Biker Jacket", "Buttery-soft genuine leather with an asymmetric zip and quilted lining.", 249.99, 199.99, "Clothing", "Atelier", "1551028719-00167b16eac5", 14, 4.8, 64],
  ["Slim Fit Denim Jeans", "Stretch selvedge denim in a dark indigo wash that only gets better with wear.", 69.99, 0, "Clothing", "EcoWear", "1542272604-787c3835535d", 75, 4.3, 219],
  ["Heavyweight Pullover Hoodie", "Brushed-fleece 400gsm cotton hoodie with a double-lined hood and kangaroo pocket.", 59.99, 47.99, "Clothing", "EcoWear", "1556821840-3a63f95609a7", 66, 4.6, 187],
  ["Insulated Water Bottle", "Double-wall stainless steel 750ml bottle that keeps drinks cold for 24 hours or hot for 12.", 29.99, 0, "Home & Kitchen", "HydroLife", "1602143407151-7111542de6e8", 90, 4.7, 356],
  ["Single-Origin Coffee Beans 1kg", "Medium-roast Ethiopian beans with notes of blueberry, jasmine and dark chocolate.", 27.99, 22.99, "Home & Kitchen", "Roastery", "1495474472287-4d71bcdd2085", 64, 4.8, 274],
  ["Modern Table Lamp", "Warm, dimmable LED lamp with a linen shade and solid oak base.", 54.99, 0, "Home & Kitchen", "Hearth", "1507473885765-e6ed057f782c", 33, 4.4, 77],
  ["Ergonomic Office Chair", "Adjustable lumbar support, 4D armrests and a breathable mesh back for all-day comfort.", 289.99, 239.99, "Furniture", "ComfortPlus", "1580480055273-228ff5388ef8", 15, 4.5, 133],
  ["Scandinavian Accent Chair", "Mid-century inspired lounge chair with solid ash legs and a moulded shell seat.", 179.99, 0, "Furniture", "Hearth", "1592078615290-033ee584e267", 11, 4.6, 59],
  ["Hydrating Skincare Set", "Three-step routine — cleanser, serum and moisturiser — with hyaluronic acid and vitamin C.", 64.99, 49.99, "Beauty", "Lumière", "1556228720-195a672e8a03", 44, 4.5, 198],
  ["Eau de Parfum 50ml", "A warm, woody fragrance with bergamot, cedar and amber. Long-lasting and unisex.", 89.99, 0, "Beauty", "Lumière", "1585386959984-a4155224a1ad", 27, 4.4, 91],
  ["Non-Slip Yoga Mat", "6mm natural rubber mat with alignment markings and a carry strap.", 39.99, 29.99, "Sports", "FitTrack", "1601925260368-ae2f83cf8b7f", 58, 4.6, 244],
  ["Bestselling Hardcover Novel", "The award-winning literary thriller everyone is talking about. Clothbound collector's edition.", 22.99, 17.99, "Books", "Paperleaf", "1544947950-fa07a98d237f", 100, 4.7, 612],
];

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany({}), Product.deleteMany({}), Cart.deleteMany({}), Order.deleteMany({})]);

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

  // create() rather than insertMany() so the pre-save hook generates each unique slug.
  await Product.create(
    catalogue.map(
      ([name, description, price, discountPrice, category, brand, photoId, stock, ratingsAverage, ratingsCount]) => ({
        name,
        description,
        price,
        discountPrice,
        category,
        brand,
        images: [image(photoId)],
        stock,
        ratingsAverage,
        ratingsCount,
        createdBy: admin._id,
      })
    )
  );

  console.log(`Seed data inserted successfully (${catalogue.length} products, carts and orders cleared).`);
  console.log("Admin login: admin@example.com / admin123");
  console.log("Customer login: customer@example.com / customer123");
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
