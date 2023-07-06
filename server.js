require("dotenv").config({ path: "./config.env" });
const express = require("express");
const connectDB = require("./config/db");

const errorHandler = require("./middleware/error");

// Connect DB
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", require("./routes/auth"));

app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("unhandledRejection", (error, promise) => {
  console.log(`Logged Error: ${error}`);
  server.close(() => process.exit(1));
});
