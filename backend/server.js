const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
const authRoutes = require("./routes/authRoutes");
const issueRoutes = require("./routes/issueRoutes");
const userRoutes = require("./routes/userRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const trafficRoutes = require("./routes/trafficRoutes");
const forumRoutes = require("./routes/forumRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const briberyRoutes = require("./routes/briberyRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/users", userRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/bribery", briberyRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/leaderboard", leaderboardRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Civic Intelligence API running" });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});