
// const rateLimit = require("express-rate-limit");
// const logger = require("./config/logger");

// const path = require("path");

// // Trust proxy if behind one
// // app.set("trust proxy", 1);

// // Basic rate limiter (optional)
// // app.use(rateLimit({
// //   windowMs: 15 * 60 * 1000,
// //   max: 250,
// //   message: "Too many requests from this IP, please try again later."
// // }))

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = require("./swaggerOptions");
const specs = swaggerJsDoc(options);

//routes:
const plaidRoutes = require("./routes/Plaidroutes");
const apiRoutes = require("./routes/index"); // transactions, categories, etc.
const budgetRoutes = require("./routes/budget");
const cardRoutes = require("./routes/cardRoutes");
const authRoutes = require("./routes/authRoutes");
const debtRoutes = require("./routes/debtRoutes");
const savingsRoutes = require("./routes/savingsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// middleware
app.use(express.json());
// Security headers
app.use(helmet());
// CORS 
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// --- Connect to MongoDB ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

//Swagger
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(specs));

//Routes
app.use("/api/v1/plaid", plaidRoutes);
app.use("/api/v1", apiRoutes);
app.use("/api/v1/budget", budgetRoutes);
app.use("/api/v1/cards", cardRoutes);
app.use("/api/v1/debts", debtRoutes);
app.use("/api/v1/savings", savingsRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/transactions", transactionRoutes);

// Auth routes
app.use("/api/v1/auth", authRoutes);

// HEALTH
app.get("/", (req, res) => {
  res.send(" Cache Budget API is running! ");
});

// Version info
app.get("/api/v1", (req, res) => {
  res.json({
    message: "Welcome to Cache Budget API v1",
    endpoints: {
      categories: "/api/v1/categories",
      transactions: "/api/v1/transactions",
      cards: "/api/v1/cards",
      docs: "/api/v1/docs",
    },
  });
});

// --- SERVE FRONTEND IN PRODUCTION ---
app.use(express.static(path.join(__dirname, "client/dist")));
if (process.env.NODE_ENV === 'production') {
  // Serve static frontend files
  app.use(express.static(path.join(__dirname, 'client', 'dist')));

  // Catch-all route to serve index.html
  app.get('*', (req, res) => {
    const indexPath = path.resolve(__dirname, 'client', 'dist', 'index.html');
    res.sendFile(indexPath, err => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Server error');
      }
    });
  });
}

//centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Something went wrong." });
});

// --- Start server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);