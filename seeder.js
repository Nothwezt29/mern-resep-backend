const mongoose = require("mongoose");
const fs = require("fs");

// 🔗 Koneksi ke MongoDB Atlas kamu
mongoose.connect("mongodb://resepuser:qwerty123@ac-wkl8tqa-shard-00-00.fkhhvsb.mongodb.net:27017,ac-wkl8tqa-shard-00-01.fkhhvsb.mongodb.net:27017,ac-wkl8tqa-shard-00-02.fkhhvsb.mongodb.net:27017/resepdb?ssl=true&replicaSet=atlas-wkl8tqa-shard-0&authSource=admin&retryWrites=true&w=majority", {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000
  })
    .then(() => console.log("✅ MongoDB Atlas direct connected"))
    .catch(err => console.error("❌ MongoDB direct connection error:", err));
  

const ResepSchema = new mongoose.Schema({
  Title: String,
  Ingredients: String,
  Steps: String,
  Loves: Number,
  URL: String,
});

// Koleksi utama: 'reseps'
const Resep = mongoose.model("Resep", ResepSchema, "reseps");

// 📁 Baca isi file JSON
const data = JSON.parse(fs.readFileSync("./resepdata.json", "utf-8"));

async function seedData() {
  try {
    console.log(`🧾 Total data akan dimasukkan: ${data.length}`);
    
    await Resep.deleteMany({});
    console.log("🧹 Koleksi lama dihapus...");

    await Resep.insertMany(data);
    console.log("🌱 Semua data resep berhasil dimasukkan ke MongoDB Atlas!");

    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error saat seeding:", err);
  }
}

seedData();
