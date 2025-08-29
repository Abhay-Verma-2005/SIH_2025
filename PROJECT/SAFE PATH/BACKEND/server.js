const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
