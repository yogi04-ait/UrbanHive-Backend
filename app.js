const express = require('express')
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");
const connectDB = require('./config/database')
const authRouter = require('./routes/auth');
const productRouter = require('./routes/product');
const sellerRouter = require('./routes/seller')
const customerRouter = require("./routes/customer")
const orderRouter = require("./routes/order")
require('dotenv').config()
app.use(express.json())
app.use(cookieParser());


app.use(cors({
    origin: process.env.FRONTEND,
    credentials: true,
}))


connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log('server is running')
    })

}).catch(error => {
    console.log(error.message)
})


app.use("/", authRouter)
app.use("/", sellerRouter)
app.use("/", productRouter)
app.use("/", customerRouter)
app.use("/", orderRouter);