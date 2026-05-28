console.log("Starting import test...");

try {
    await import("./models/User.js");
    console.log("✅ User.js loaded");
} catch (e) { console.error("❌ User.js failed:", e); process.exit(1); }

try {
    await import("./controllers/authController.js");
    console.log("✅ authController.js loaded");
} catch (e) { console.error("❌ authController.js failed:", e); process.exit(1); }

try {
    await import("./routes/authRoutes.js");
    console.log("✅ authRoutes.js loaded");
} catch (e) { console.error("❌ authRoutes.js failed:", e); process.exit(1); }

try {
    await import("./controllers/orderController.js");
    console.log("✅ orderController.js loaded");
} catch (e) { console.error("❌ orderController.js failed:", e); process.exit(1); }

try {
    await import("./routes/orderRoutes.js");
    console.log("✅ orderRoutes.js loaded");
} catch (e) { console.error("❌ orderRoutes.js failed:", e); process.exit(1); }

console.log("🎉 All imports successful!");
