const express = require('express')
const app = express();
const connectDB = require('./config/database')
require('dotenv').config()

connectDB().then(()=>{
     app.listen(process.env.PORT, ()=>{
        console.log('server is running')
     })

}).catch(error=>{
    console.log(error.message)
})


