const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// --- Twilio Setup ---
const twilio = require("twilio");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const app = express();
const PORT = 8000; // ✅ All on same port

// --- Middleware ---
app.use(express.json());
app.use(cors());

// --- Serve Static Frontend ---
app.use(express.static(path.join(__dirname, "frontend", "main")));

// --- Default route -> login.html instead of homepage.html ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "main", "login.html"));
});

// --- MongoDB Connection ---
const MONGO_URI =
  "mongodb+srv://upendrachaturvedi99_db_user:sih25@cluster0.qq6r9bx.mongodb.net/";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// --- Mongoose Schemas ---
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dob: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true, trim: true },
    isAadhaarVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const aadhaarDummyDataSchema = new mongoose.Schema({
  aadhaarNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  dob: { type: String, required: true },
  mobileNumber: { type: String, required: true },
});
const AadhaarDummyData = mongoose.model(
  "AadhaarDummyData",
  aadhaarDummyDataSchema
);

const otpSchema = new mongoose.Schema({
  mobileNumber: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 },
});
const Otp = mongoose.model("Otp", otpSchema);

// --- Helper Function to Send OTP ---
async function sendOtp(mobileNumber, messagePrefix) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);
  await Otp.findOneAndUpdate(
    { mobileNumber },
    { otp: hashedOtp },
    { upsert: true, new: true }
  );

  await twilioClient.messages.create({
    body: `${messagePrefix} OTP is: ${otp}`,
    from: twilioPhoneNumber,
    to: mobileNumber,
  });
}

// --- API Routes ---
async function requestSignupOtp(mobileNumber) {
  try {
    const response = await fetch("http://localhost:8000/signup/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobileNumber }),
    });

    const data = await response.json();
    console.log(data); // should print { message: "... OTP sent successfully" }
  } catch (err) {
    console.error("Error:", err);
  }
}

// == SIGNUP ==
app.post("/signup/request-otp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber)
      return res.status(400).json({ message: "Mobile number is required." });

    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }

    await sendOtp(mobileNumber, "Your signup");
    res.status(200).json({ message: "Signup OTP sent successfully." });
  } catch (error) {
    console.error("Signup OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

app.post("/signup/verify", async (req, res) => {
  try {
    const { name, dob, mobileNumber, otp } = req.body;
    if (!name || !dob || !mobileNumber || !otp) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const otpRecord = await Otp.findOne({ mobileNumber });
    if (!otpRecord)
      return res.status(400).json({ message: "Invalid OTP or expired." });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP." });

    const newUser = new User({ name, dob, mobileNumber });
    await newUser.save();
    await Otp.deleteOne({ mobileNumber });

    res
      .status(201)
      .json({ message: "User registered successfully!", user: newUser });
  } catch (error) {
    console.error("Signup Verify Error:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// == LOGIN ==
app.post("/login/request-otp", async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber)
      return res.status(400).json({ message: "Mobile number is required." });

    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No account found. Please sign up." });
    }

    await sendOtp(mobileNumber, "Your login");
    res.status(200).json({ message: "Login OTP sent successfully." });
  } catch (error) {
    console.error("Login OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP." });
  }
});

app.post("/login/verify", async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;
    if (!mobileNumber || !otp)
      return res
        .status(400)
        .json({ message: "Mobile number and OTP are required." });

    const otpRecord = await Otp.findOne({ mobileNumber });
    if (!otpRecord)
      return res.status(400).json({ message: "Invalid OTP or expired." });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP." });

    const user = await User.findOne({ mobileNumber });
    await Otp.deleteOne({ mobileNumber });

    res.status(200).json({ message: "Login successful!", user });
  } catch (error) {
    console.error("Login Verify Error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// == AADHAAR ==
app.post("/aadhaar/request-otp", async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber)
      return res.status(400).json({ message: "Aadhaar number is required." });

    const aadhaarRecord = await AadhaarDummyData.findOne({ aadhaarNumber });
    if (!aadhaarRecord)
      return res.status(404).json({ message: "Aadhaar number not found." });

    await sendOtp(aadhaarRecord.mobileNumber, "Your Aadhaar verification");

    const maskedMobile = `XXXXXX${aadhaarRecord.mobileNumber.slice(-4)}`;
    res
      .status(200)
      .json({ message: `OTP sent successfully to ${maskedMobile}` });
  } catch (error) {
    console.error("Aadhaar Request OTP Error:", error);
    res
      .status(500)
      .json({ message: "Server error during Aadhaar verification." });
  }
});

app.post("/aadhaar/verify", async (req, res) => {
  try {
    const { aadhaarNumber, otp, loggedInUserMobile } = req.body;
    if (!aadhaarNumber || !otp || !loggedInUserMobile) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const aadhaarRecord = await AadhaarDummyData.findOne({ aadhaarNumber });
    if (!aadhaarRecord)
      return res.status(404).json({ message: "Aadhaar details not found." });

    const otpRecord = await Otp.findOne({
      mobileNumber: aadhaarRecord.mobileNumber,
    });
    if (!otpRecord)
      return res.status(400).json({ message: "Invalid OTP or expired." });

    const isMatch = await bcrypt.compare(otp, otpRecord.otp);
    if (!isMatch) return res.status(400).json({ message: "Invalid OTP." });

    const updatedUser = await User.findOneAndUpdate(
      { mobileNumber: loggedInUserMobile },
      { isAadhaarVerified: true },
      { new: true }
    );

    await Otp.deleteOne({ mobileNumber: aadhaarRecord.mobileNumber });

    res
      .status(200)
      .json({ message: "Aadhaar verification successful!", user: updatedUser });
  } catch (error) {
    console.error("Aadhaar Verify Error:", error);
    res
      .status(500)
      .json({ message: "Server error during OTP verification." });
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
