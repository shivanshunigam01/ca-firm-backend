const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/env");

(async () => {
  try {
    await connectDB();

    app.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      console.log(`📡 API Base: http://localhost:${config.PORT}/api`);
    });
  } catch (error) {
    console.error("❌ Failed to boot server:", error.message);
    process.exit(1);
  }
})();
