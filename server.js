const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://10.198.61.157:3000",
    "https://tunefully-hyperdiastolic-charleen.ngrok-free.dev"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// // 🔗 Koneksi ke MongoDB Atlas
// mongoose.connect("mongodb://resepuser:qwerty123@ac-wkl8tqa-shard-00-00.fkhhvsb.mongodb.net:27017,ac-wkl8tqa-shard-00-01.fkhhvsb.mongodb.net:27017,ac-wkl8tqa-shard-00-02.fkhhvsb.mongodb.net:27017/resepdb?ssl=true&replicaSet=atlas-wkl8tqa-shard-0&authSource=admin&retryWrites=true&w=majority", {
//   serverSelectionTimeoutMS: 30000,
//   connectTimeoutMS: 30000,
//   socketTimeoutMS: 45000
// })
//   .then(() => console.log("✅ MongoDB Atlas direct connected"))
//   .catch(err => console.error("❌ MongoDB direct connection error:", err));



// mongoose.connect("mongodb+srv://resepuser:qwerty123@nothwezt.fkhhvsb.mongodb.net/resepdb?retryWrites=true&w=majority&appName=Nothwezt")
//   .then(() => console.log("✅ MongoDB Atlas connected"))
//   .catch(err => console.error("❌ MongoDB Atlas error:", err));

// app.listen(5000, () => {
//   console.log("🚀 Backend running on http://localhost:5000");
// });

// 🔗 Koneksi ke MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/resepdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

// ⚡ Koleksi di MongoDB namanya "reseps"
const Resep = mongoose.model("Resep", ResepSchema, "reseps");

app.get("/", (req, res) => {
  res.send("✅ Server kamu sudah berjalan dan bisa diakses dari HP!");
});

// 🔍 Endpoint Search Resep (STRICT Title Only + Synonyms)
app.get("/api/search", async (req, res) => {
  try {
    let q = req.query.q || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 16;
    const skip = (page - 1) * limit;

    if (!q.trim()) {
      return res.json([]);
    }

    // 🔑 Mapping sinonim (bisa tambah sendiri)
    const synonyms = {
      ayam: ["ayam", "chicken"],
      sapi: ["sapi", "beef", "daging sapi"],
      kambing: ["kambing", "goat", "mutton"]
    };

    // Ambil kata kunci utama
    const key = q.toLowerCase();

    // Kalau ada sinonim, pakai semuanya
    const terms = synonyms[key] || [q];

    // Buat regex untuk semua kata kunci
    const regexConditions = terms.map((word) => ({
      Title: { $regex: new RegExp(word, "i") }
    }));

    // Cari hanya di Title, harus cocok salah satu sinonim
    const results = await Resep.find({
      $or: regexConditions
    })
      .skip(skip)
      .limit(limit);

    res.json(results);
  } catch (err) {
    console.error("❌ Error search:", err);
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Jalankan server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
