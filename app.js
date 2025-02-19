const express = require('express')
const app = express();
const connectDB = require('./config/database')
const authRouter = require('./routes/Auth')
require('dotenv').config()
app.use(express.json())

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log('server is running')
    })

}).catch(error => {
    console.log(error.message)
})


app.use("/", authRouter)

