const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const userRoutes = require("./routes/userRoutes");
const geminiRoutes = require("./routes/geminiRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gemini", geminiRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Civic Intelligence API running" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});