const mongoose = require('mongoose');
const Seller = require('./seller');
const Size = require('./size')
const { ObjectId } = mongoose.Schema.Types

const productSchema = new mongoose.Schema({
    seller: {
        type: ObjectId,
        ref: 'Seller',
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        enum: {
            values: ['topwear', 'bottomwear', 'winterwear',]
        },
        validate(value) {
            if (["topwear", "bottomwear", "winterwear"].includes(value)) {
                throw new Error("Not a valid category")
            }
        }
    },
    category: {
        type: String,
        enum: {
            values: ['men', 'women', 'kids',]
        },
        validate(value) {
            if (["men", "women", "kids"].includes(value)) {
                throw new Error("Not a valid gender category")
            }
        }
    },
    price: {
        type: Number,
        required: true
    },
    sizes: [
        {
            type: ObjectId,
            ref: 'Size',
            required: true,
        }

    ],
    images: {
        type: [String],
        required: true
    }


})

const Product = mongoose.model('Product', productSchema);

module.exports = Product