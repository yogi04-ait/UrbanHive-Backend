process.on("uncaughtException", (err) => {
    console.error("🔥 Uncaught Exception: ", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Promise Rejection: ", reason);
});

const express = require('express')
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");
const connectDB = require('./config/database')
const authRouter = require('./routes/Auth');
const productRouter = require('./routes/product');
const sellerRouter = require('./routes/seller')
const customerRouter = require("./routes/customer")
const orderRouter = require("./routes/order")
require('dotenv').config()
app.use(express.json())
app.use(cookieParser());
const fs = require('fs')
const https = require('https')
const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};



app.use(cors({
    origin: process.env.FRONTEND,
    credentials: true,
}))


connectDB().then(() => {
    https.createServer(options, app).listen(process.env.PORT, () => {
        console.log(`HTTPS Server running on port ${process.env.PORT}`);
    });

}).catch(error => {
    console.log(error.message)
})


app.use("/", authRouter)
app.use("/", sellerRouter)
app.use("/", productRouter)
app.use("/", customerRouter)
app.use("/", orderRouter);