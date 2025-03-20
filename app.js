process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception: ", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Promise Rejection: ", reason);
});

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/database");
const authRouter = require("./routes/Auth");
const productRouter = require("./routes/product");
const sellerRouter = require("./routes/seller");
const customerRouter = require("./routes/customer");
const orderRouter = require("./routes/order");
require("dotenv").config();

app.use(express.json());
app.use(cookieParser());

app.use(
    cors({
        origin: process.env.FRONTEND,
        credentials: true,
    })
);

connectDB()
    .then(() => {
        // 🔥 Use HTTP instead of HTTPS
        const http = require("http");
        http.createServer(app).listen(process.env.PORT, () => {
            console.log(`🚀 HTTP Server running on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log(error.message);
    });

app.use("/", authRouter);
app.use("/", sellerRouter);
app.use("/", productRouter);
app.use("/", customerRouter);
app.use("/", orderRouter);
