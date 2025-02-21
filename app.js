const express = require('express')
const app = express();
const connectDB = require('./config/database')
const authRouter = require('./routes/auth')
require('dotenv').config()
app.use(express.json())

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log('server is running')
    })

}).catch(error => {
    console.log(error.message)
})


app.use("/", authRouter)

app.post('/upload', upload.single('file'), function (req, res) {
    res.json(req.file)
})

