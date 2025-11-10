const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://10.198.61.157:3000",
      "https://tunefully-hyperdiastolic-charleen.ngrok-free.dev",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// 🔗 Koneksi MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://resepuser:qwerty123@nothwezt.fkhhvsb.mongodb.net/resepdb?retryWrites=true&w=majority&appName=Nothwezt"
  )
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB Atlas error:", err));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ MongoDB connected");
});

// 🗂 Schema Resep
const ResepSchema = new mongoose.Schema({
  Title: String,
  Ingredients: String,
  Steps: String,
  Loves: Number,
  URL: String,
});

// Koleksi: reseps
const Resep = mongoose.model("Resep", ResepSchema, "reseps");

// 👉 Default route
app.get("/", (req, res) => {
  res.send("✅ Server kamu sudah berjalan dan bisa diakses dari HP!");
});

// 🔍 Search Resep (dengan sinonim & pagination)
app.get("/api/search", async (req, res) => {
  try {
    let q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;
    const skip = (page - 1) * limit;

    if (!q.trim()) {
      return res.json([]);
    }

    // Sinonim
    const synonyms = {
      ayam: ["ayam", "chicken"],
      sapi: ["sapi", "beef", "daging sapi"],
      kambing: ["kambing", "goat", "mutton"],
    };

    const key = q.toLowerCase();
    const terms = synonyms[key] || [q];

    const regexConditions = terms.map((word) => ({
      Title: { $regex: new RegExp(word, "i") },
    }));

    const results = await Resep.find({ $or: regexConditions })
      .skip(skip)
      .limit(limit);

    res.json(results);
  } catch (err) {
    console.error("❌ Error search:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🟦 Tambahan Endpoint Baru (AMAN)

// 👉 GET semua resep
app.get("/api/reseps", async (req, res) => {
  try {
    const data = await Resep.find({});
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 GET resep detail based on ID
app.get("/api/reseps/:id", async (req, res) => {
  try {
    const data = await Resep.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Resep tidak ditemukan" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
