const mongoose = require('mongoose');
const Seller = require('./seller');
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
            values: ['topwear', 'bottomwear', 'winterwear', 'ethnicwear',]
        },
        validate(value) {
            if (!["topwear", "bottomwear", "winterwear","ethnicwear"].includes(value)) {
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
            if (!["men", "women", "kids"].includes(value)) {
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
            size: {
                type: String,
                required: true,
                enum: ['S', 'M', 'L', 'XL']
            },
            quantity: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    images: [
        {
            publicId: {
                type: String,
                required: true
            },

            imageUrls: {
                type: String,
                required: true
            }
        }
    ],

    isDeleted: { type: Boolean, default: false },


}, { timestamps: true })

const Product = mongoose.model('Product', productSchema);

module.exports = Product