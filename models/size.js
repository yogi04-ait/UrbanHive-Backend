const mongoose = require('mongoose')
const sizeSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        enum: ['S', 'M', 'L', 'XL'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    }
})

const Size = mongoose.model('Size', sizeSchema);

module.exports = Size