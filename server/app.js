// app.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const Razorpay = require("razorpay");
const mongoose = require('mongoose'); // <-- 1. Import mongoose

const userRoutes = require("./routes/userRoutes");
const sellRoutes = require("./routes/sellRoutes");
const listedRoutes = require("./routes/listedRoutes");
const productRoutes = require("./routes/productRoures");
const profileRoutes = require("./routes/profileRoutes");
const generateUploadURL = require("./config/s3");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const Ping = mongoose.models.Ping || mongoose.model('Ping', new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now }
}));

// Routes
app.get("/api", (req, res) => {
  res.send("listining to port");
});

app.use("/api/user", userRoutes);
app.use("/api/sell", sellRoutes);
app.use("/api/listed", listedRoutes);
app.use("/api/product", productRoutes);
app.use("/api/profile", profileRoutes);

app.get("/s3Url", async (req, res) => {
  const url = await generateUploadURL();
  res.send({ url });
});

app.post("/api/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    if (!req.body) {
      return res.status(400).send("Bad Request no body");
    }
    const options = req.body;

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(400).send("Bad Request");
    }

    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.post("/api/validate", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  // order_id + " | " + razorpay_payment_id

  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

  const digest = sha.digest("hex");

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: " Transaction is not legit!" });
  }

  res.json({
    msg: " Transaction is legit!",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });
});

// app.post('/api/healthcheck', async (req, res) => {
//   try {
//     const newPing = await Ping.create({ message: req.body.message || 'pong' });
//     res.status(201).json({ success: true, ping: newPing });
//   } catch (error) {
//     console.error('Healthcheck Error:', error); // <--- Add this log
//     res.status(500).json({ success: false, error: error.message });
//   }
// });
app.get('/api/healthcheck', async (req, res) => {
  try {
    // 1. Check if MongoDB connection is ready (1 = connected)
    const dbStatus = mongoose.connection.readyState === 1;

    if (!dbStatus) {
      return res.status(503).json({
        success: false,
        status: 'UNHEALTHY',
        message: 'Database not connected'
      });
    }

    // 2. Return 200 OK for successful healthcheck
    res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Healthcheck Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, 'public', 'index.html')
// ))
// 404 Catch-all Route
app.get("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "This route does no exist",
  });
});

// Export app instance ONLY (do not connect to DB or call app.listen here)
module.exports = app;
